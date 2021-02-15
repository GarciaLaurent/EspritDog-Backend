import { Slack } from '../services/slack';

import { fetchPOEditor } from '@docavenue/nodejs';
import fs from 'fs';
import jsonConcat from 'json-concat';
import mv from 'mv';
import rdiff from 'recursive-diff';
import rimraf from 'rimraf';

export class PoEditorScraper {
  count = 0;
  originPath = `${__dirname}/../../static`;
  path = `${this.originPath}/new`;
  pathOld = `${this.originPath}/old`;
  languages = ['fr'];
  projects = [
    {
      key: 'proMobile',
      apiKey: '09e68088d001400694f9dcbc3da05172',
      projectId: '399423',
    },
    {
      key: 'patMobile',
      apiKey: '09e68088d001400694f9dcbc3da05172',
      projectId: '399419',
    },
    {
      key: 'patFrontend',
      apiKey: '09e68088d001400694f9dcbc3da05172',
      projectId: '292751',
    },
    {
      key: 'proFrontend',
      apiKey: '09e68088d001400694f9dcbc3da05172',
      projectId: '309881',
    },
  ];

  constructor() {
    try {
      fs.rmdirSync(this.path, {
        recursive: true,
      });

      // fs.rmdirSync(this.pathOld, {
      //   recursive: true,
      // });
    } catch (e) {
      console.warn(`[ERROR] Creating or removing directory ${this.path}`, e);
    }
  }

  async start() {
    try {
      await this.fetch();
      const diff = await this.compare();
      await this.communicate(diff);
    } catch (e) {}
  }

  async fetch() {
    const realPath = `${this.path}/locales/fr`;

    for (const index in this.projects) {
      const project = this.projects[index];
      console.log('[INFO] Fetch translations for project ' + project.key);

      console.log('[INFO] Trying to create directory ' + this.path);

      // create dir
      try {
        fs.mkdirSync(realPath, { recursive: true });
      } catch (e) {}

      // fetch phrases
      await fetchPOEditor({
        languages: this.languages,
        apiKey: project.apiKey,
        projectId: project.projectId,
        staticPath: this.path,
      });
      console.log('[INFO] Translations fetched for ' + project.key);
    }

    // merge phrases into one json
    await this.mergeJsonIntoOne(realPath);
  }

  /**
   * Merge translations into one .json file for easier comparision.
   *
   * @param theDirectory
   */
  async mergeJsonIntoOne(theDirectory: string) {
    // an array of filenames to concat
    const files: string[] = [];

    fs.readdirSync(theDirectory).forEach((file: string) => {
      files.push(theDirectory + '/' + file);
    });

    // pass the "files" to json concat
    await jsonConcat(
      {
        src: files,
        dest: `${theDirectory}/merged.json`,
      },
      function (json: string) {
        console.log('[INFO] Done merging JSON.');
      },
    );

    // !!!!!!!! Petit hack - car JSON concat n'est pas vraiment synchrone !!!!
    await this.sleep(5500);
  }

  /**
   * Compare translations with t-1.
   * If something changed, we notify Slack.
   */
  async compare() {
    let diff = null;

    // in a first time, we compare the newly downloaded files with old ones
    try {
      // we check we have N and N-1 versions of our editor phrases
      fs.accessSync(this.pathOld);
      fs.accessSync(this.path);

      // we compare JSON
      for (const index in this.projects) {
        const project = this.projects[index];

        // new JSON file
        const newJSONFile = `${this.path}/locales/fr/merged.json`;
        const newJSONContent = await fs.readFileSync(newJSONFile, 'utf8');
        console.log(
          '[INFO] Read new file content for ' + newJSONFile,
          // newJSONContent,
        );

        // OLD json file
        const oldJSONFile = `${this.pathOld}/locales/fr/merged.json`;
        const oldJSONContent = await fs.readFileSync(oldJSONFile, 'utf8');
        console.log(
          '[INFO] Read old file content for ' + oldJSONFile,
          // oldJSONContent,
        );

        // We get the diff between the two files.
        const diffBetweenJSONs = rdiff.getDiff(
          JSON.parse(oldJSONContent),
          JSON.parse(newJSONContent),
        );
        console.log('Diff', diffBetweenJSONs);

        diff = { diffBetweenJSONs, oldJSON: JSON.parse(oldJSONContent) };
      }
    } catch (e) {
      console.log('[ERREUR]', e);
    }

    console.log('[INFO] Moving directories to old.');
    try {
      rimraf.sync(`${this.pathOld}`);
    } catch (e) {
      console.log('[ERROR] Deleting directory', this.pathOld);
    }

    await mv(
      `${this.path}`,
      `${this.pathOld}`,
      { mkdirp: true },
      function (err: any) {
        console.log('[INFO] End moving dirs.', err);
      },
    );

    return diff;
  }

  /**
   * Communicate diffs to Slack.
   */
  async communicate(d: any) {
    // const d = [
    //   { op: 'update', path: ['0_DOCUMENTS'], val: 'Aucun document...' },
    // ];

    let res = '';
    if (d !== null) {
      for (const index in d?.diffBetweenJSONs) {
        if (res === '') {
          res = '💬 Modifications PO editor :';
        }

        const diffItem = d?.diffBetweenJSONs[index];
        const action = diffItem?.['op'] || '?';
        const key = diffItem?.['path']?.[0] || '?';
        const newVal = diffItem?.['val'] || '';
        const oldValue = d?.oldJSON?.[key] || '?';

        res = `${res}
- [${action.toUpperCase()}] ${key} = '${oldValue}'  ➡️  '${newVal}'`;
      }

      if (res !== '') {
        console.log('[INFO] Changes : ', res);
        new Slack().slackSendPoEditorChanges(res);
      }
    }
  }

  // firty hack
  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
