import log from './log';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  log.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  log.debug('Using .env.example file to supply config environment variables');
  dotenv.config({ path: '.env.example' }); // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV;
