import log from './log';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  log.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
}

export const ENVIRONMENT = process.env.NODE_ENV;
