import { OS, UserType } from '../util/constants';
import { Slack } from '../services/slack';
import { Review } from '../models/Review';
import { ApiReview } from '../api';
import moment from 'moment';

const publisher = new Slack();

type AppId = string | number;

export abstract class Scraper {
  abstract os: OS;
  abstract userType: UserType;
  abstract appId: AppId;

  abstract fetchReviews(appId: AppId): Review[];

  public async scrap(reviews: Review[]): Promise<void> {
    const uniqueId = this.os + ' ' + this.userType;

    console.log(
      '[INFO] Scrapping ' + reviews.length + ' reviews on ' + uniqueId,
    );

    let newReviews: Review[] = [];

    // 1) fetch reviews in DB
    const lastDbReview = await ApiReview.getLastReviewTimestamp(
      this.os,
      this.userType,
    );

    // 2) find out which reviews are not in db and format
    if (lastDbReview) {
      reviews.forEach((review: Review) => {
        const lastReviewDate = moment(lastDbReview.date);
        const thisReviewDate = moment(review.date);

        if (lastReviewDate.isBefore(thisReviewDate)) {
          console.log('[INFO] Found new review', review);
          newReviews.push(review);
        }
      });
    } else {
      // cas d'une base vide.
      newReviews = reviews;
    }

    // 3) store new reviews in db (the latest new review is at index 0)
    if (newReviews.length > 0) {
      await ApiReview.insertOrUpdate(this.os, this.userType, newReviews[0]);
    }

    // 4) slack new reviews in db
    if (newReviews.length > 10) {
      return console.log(
        '[ERROR] Too many results (' + newReviews.length + ') would spam Slack',
        this.os,
        this.userType,
      );
    }

    if (!newReviews.length) {
      return console.log('[INFO] No new comment', this.os, this.userType);
    }

    newReviews.forEach((review) =>
      publisher.slackSendReview(review, this.os, this.userType),
    );
  }
}
