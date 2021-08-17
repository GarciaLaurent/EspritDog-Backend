import dotenv from 'dotenv';
dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import mongoose from 'mongoose';
import app from './app';
import { MONGODB_URI } from './util/secrets';
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = Promise;
(async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to mongo');
    /**
     * Error Handler. Provides full stack - remove for production
     */

    /**
     * Start Express server.
     */
    app.listen(3333, () => {
      console.log(
        '  App is running at http://localhost:%d in %s mode', //ex: http://localhost:3333/Orders
        // app.get('port'),
        // app.get('env'),
      );
      console.log('  Press CTRL-C to stop\n');
    });
  } catch (err) {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`,
    );
    console.error(err);
  }
})();
