import express from 'express';
import compression from 'compression'; // compresses requests
import bodyParser from 'body-parser';
import cron from 'node-cron';
import './services/firebase';
import { IosPatScraper, IosProScraper } from './controllers/ios-scraper';
import {
  AndroidPatScraper,
  AndroidProScraper,
} from './controllers/android-scraper';
import { PoEditorScraper } from './controllers/po-editor-scraper';

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Slack scrappers for :
 * - iOS pat
 * - iOS pro
 * - Android pat
 * - Android pro
 **/
const reviewsScrapper = () => {
  new IosPatScraper();
  new IosProScraper();
  new AndroidPatScraper();
  new AndroidProScraper();
};

/**
 * PO editor scraper to get notified about changes.
 */
const PoEditorScraping = new PoEditorScraper();

/**
 * Scrapper INDEX
 * - Reviews
 * - PO editor changes
 **/
const runScrapper = async () => {
  reviewsScrapper();

  try {
    await PoEditorScraping.start();
  } catch (e) {}
};

// Initial run on server start
runScrapper();
setTimeout(() => {
  runScrapper();
}, 15000);

// Next run every 5 minutes.
cron.schedule('*/5 * * * *', () => {
  console.log('███████████████ CRON RUN ███████████████', new Date());
  runScrapper();
});

export default app;
