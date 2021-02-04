import gplay from 'google-play-scraper';
import {
  OS,
  UserType,
  AndroidAppId,
  NUMBER_OF_REVIEWS,
} from '../util/constants';
import { Scraper } from './review-scraper';

abstract class AndroidScraper extends Scraper {
  os = OS.Android;
  fetchReviews(): any {
    return gplay
      .reviews({
        appId: this.appId.toString(),
        sort: gplay.sort.NEWEST,
        num: NUMBER_OF_REVIEWS,
        lang: 'fr',
      })
      .catch(console.log);
  }
}

export class AndroidPatScraper extends AndroidScraper {
  userType = UserType.Pat;
  appId = AndroidAppId.Pat;

  constructor() {
    super();
    this.watch();
  }

  async watch() {
    const reviews = await this.fetchReviews();
    this.scrap(reviews.data);
  }
}

export class AndroidProScraper extends AndroidScraper {
  userType = UserType.Pro;
  appId = AndroidAppId.Pro;

  constructor() {
    super();
    this.watch();
  }

  async watch() {
    const reviews = await this.fetchReviews();
    this.scrap(reviews.data);
  }
}
