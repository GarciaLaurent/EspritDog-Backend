import { Db, MongoClient } from 'mongodb';
import { createArrayCsvWriter } from 'csv-writer';
import AdmZip from 'adm-zip';
import Client from 'ssh2-sftp-client';
import os from 'os';
import path from 'path';
import tmp from 'tmp';
import log from './util/log';
import { ENVIRONMENT } from './util/secrets';
import fs from 'fs';
import moment from 'moment';
import { CsvWriter } from 'csv-writer/src/lib/csv-writer';

interface Mapping {
  [propertyName: string]: string;
}

const applicationTypes: Mapping = {
  APP_PUBLIC: 'app_public',
  WEB_PUBLIC: 'web_public',
  APP_PRO: 'app_pro',
  TLS: 'tel',
};

const injectionTypes: Mapping = {
  FIRST: '1',
  SECOND: '2',
};

const appointmentsHeader = [
  'date_creation',
  'date_rdv',
  'id_centre',
  'nom_centre',
  'cp_centre',
  'motif_rdv',
  'rang_vaccinal',
  'parcours_rdv',
  'annee_naissance',
  'honore',
  'annule',
];
const timeslotsHeader = [
  'date_rdv',
  'id_centre',
  'nom_centre',
  'cp_centre',
  'nb_heures',
  'nb_lignes',
];

const getZipCode = (center: {
  publicInformation: { address: { zipCode: string } };
}) => {
  return (
    (center.publicInformation &&
      center.publicInformation.address &&
      center.publicInformation.address.zipCode &&
      center.publicInformation.address.zipCode.trim()) ||
    ''
  );
};

class VaccinationStatsExporter {
  private tmpAppointments: string;
  private tmpTimeSlots: string;
  private tmpZip: string;

  private csvWriterAppointments: CsvWriter<any>;
  private csvWriterTimeslots: CsvWriter<any>;

  private db: Db;

  constructor() {
    const tmpDir = os.tmpdir();
    this.tmpAppointments = path.join(
      tmpDir,
      moment().format('YYYY-MM-DD') + '-maiia-rdv.csv',
    );
    this.tmpTimeSlots = path.join(
      tmpDir,
      moment().format('YYYY-MM-DD') + '-maiia-plages-horaires.csv',
    );

    this.tmpZip = tmp.tmpNameSync();

    this.csvWriterAppointments = createArrayCsvWriter({
      alwaysQuote: true,
      header: appointmentsHeader,
      path: this.tmpAppointments,
    });
    this.csvWriterTimeslots = createArrayCsvWriter({
      header: timeslotsHeader,
      alwaysQuote: true,
      path: this.tmpTimeSlots,
    });
  }

  public async export(): Promise<void> {
    log.info(ENVIRONMENT);

    // Connection URL
    const url = process.env.DB_URL;
    // Database Name
    const dbName = process.env.DB_NAME;
    const client = new MongoClient(url, { useNewUrlParser: true });

    try {
      // Use connect method to connect to the Server
      await client.connect();

      this.db = client.db(dbName);

      // get vaccination specility id
      const spe = await this.db
        .collection('speciality')
        .findOne({ code: 'VAC01', status: 'ACTIVE' });

      if (!spe) {
        return;
      }

      // fetch vaccination centers
      const centerCursor = this.db.collection('center').find({
        'speciality._id': spe._id,
        status: 'ACTIVE',
        isDemo: { $ne: true },
      });

      while (await centerCursor.hasNext()) {
        const center = await centerCursor.next();

        await this.writeAppointmentsLines(center);

        await this.writeTimeSlotsLines(center);
      }

      await this.zipAndUpload();
    } catch (err) {
      log.error(err.stack);
    } finally {
      fs.unlinkSync(this.tmpAppointments);
      fs.unlinkSync(this.tmpTimeSlots);
      fs.unlinkSync(this.tmpZip);
      client.close();
    }
  }

  /**
   * write lines for a center in timeslots file
   * @param center
   */
  private async writeTimeSlotsLines(center: any) {
    const agendaCount = await this.db
      .collection('agendaSettings')
      .countDocuments({
        centerId: center._id.toString(),
        status: 'ACTIVE',
      });

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() + 57);
    end.setHours(0, 0, 0, 0);

    log.info('fetch timeSlots for center : ' + center._id);
    const timeSlotCursor = this.db.collection('timeSlot').aggregate([
      {
        $match: {
          centerId: center._id.toString(),
          startDateTime: { $gt: start, $lt: end },
          'consultationReasons.injectionType': { $in: ['FIRST', 'SECOND'] },
        },
      },
      {
        $addFields: {
          startDate: {
            $dateToString: {
              date: '$startDateTime',
              format: '%Y-%m-%d',
            },
          },
        },
      },
      {
        $project: {
          duration: {
            $divide: [{ $subtract: ['$endDateTime', '$startDateTime'] }, 60000],
          },
          startDate: '$startDate',
        },
      },
      {
        $group: {
          _id: '$startDate',
          value: {
            $sum: '$duration',
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    while (await timeSlotCursor.hasNext()) {
      const values = [];

      const timeSlot = await timeSlotCursor.next();
      values.push(timeSlot._id);
      values.push(center.externalId || 'GID MANQUANT');
      values.push(center.name.trim());
      values.push(getZipCode(center));
      values.push(Math.ceil(timeSlot.value / 60));
      values.push(agendaCount);

      await this.csvWriterTimeslots.writeRecords([values]);
    }
  }

  /**
   * write lines in appointment file for a center
   * @param center
   */
  private async writeAppointmentsLines(center: any) {
    const appointmentCursor = this.db.collection('appointment').find(
      {
        centerId: center._id.toString(),
        type: 'PHYSICAL',
        patient: { $exists: true },
        'consultationReason.injectionType': { $in: ['FIRST', 'SECOND'] },
      },
      {
        projection: {
          creationDate: 1,
          startDate: 1,
          'consultationReason.name': 1,
          'consultationReason.injectionType': 1,
          'patient.birthDate': 1,
          applicationType: 1,
          status: 1,
          appointmentStatus: 1,
        },
      },
    );

    log.info('fetch appointments for center : ' + center._id);
    while (await appointmentCursor.hasNext()) {
      const values = [];

      const appointment = await appointmentCursor.next();

      values.push(moment(appointment.creationDate).format('YYYY-MM-DD'));
      values.push(moment(appointment.startDate).format('YYYY-MM-DD'));
      values.push(center.externalId || 'GID MANQUANT');
      values.push(center.name.trim());
      values.push(getZipCode(center));
      values.push(appointment.consultationReason.name);
      values.push(injectionTypes[appointment.consultationReason.injectionType]);
      values.push(applicationTypes[appointment.applicationType] || 'web_pro');
      values.push(
        (appointment.patient.birthDate &&
          moment(appointment.patient.birthDate).format('YYYY')) ||
          '',
      );
      values.push(
        appointment.appointmentStatus === 'CANCELLED' ||
          appointment.appointmentStatus === 'NO_SHOW' ||
          appointment.status === 'DELETED'
          ? false
          : true,
      );
      values.push(
        appointment.appointmentStatus === 'CANCELLED' ||
          appointment.appointmentStatus === 'NO_SHOW' ||
          appointment.status === 'DELETED'
          ? true
          : false,
      );

      await this.csvWriterAppointments.writeRecords([values]);
    }
  }

  private async zipAndUpload() {
    log.info('create zip');
    const zip = new AdmZip();
    const zipName = this.tmpZip;
    zip.addLocalFile(this.tmpAppointments);
    zip.addLocalFile(this.tmpTimeSlots);
    zip.writeZip(this.tmpZip);

    log.info('upload to ftp');
    const config = {
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
    };

    const sftp = new Client();
    const data = fs.createReadStream(zipName);
    await sftp
      .connect(config)
      .then(() => {
        return sftp.put(data, moment().format('YYYY-MM-DD') + '-maiia.zip');
      })
      .then(() => {
        return sftp.end();
      })
      .catch((err: Error) => {
        log.error(err.message);
      });
  }
}

export default VaccinationStatsExporter;
