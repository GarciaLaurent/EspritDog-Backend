import store from 'app-store-scraper';
import { OS, UserType, IOSAppId } from '../util/constants';
import { Scraper } from './review-scraper';
import { Review } from '../models/Review';

abstract class IosScraper extends Scraper {
  os = OS.IOS;

  fetchReviews(): Review[] {
    return store
      .reviews({
        id: this.appId,
        sort: store.sort.RECENT,
        country: 'fr',
      })
      .catch(console.log);
  }
}

export class IosPatScraper extends IosScraper {
  userType = UserType.Pat;
  appId = IOSAppId.Pat;

  constructor() {
    super();
    this.watch();
  }

  async watch() {
    const reviews = await this.fetchReviews();
    this.scrap(reviews);
  }
}

export class IosProScraper extends IosScraper {
  userType = UserType.Pro;
  appId = IOSAppId.Pro;

  constructor() {
    super();
    this.watch();
  }

  async watch() {
    const reviews = await this.fetchReviews();
    this.scrap(reviews);
  }
}
