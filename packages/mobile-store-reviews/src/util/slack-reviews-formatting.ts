import { Review } from '../models/Review';
import repeat from 'lodash/repeat';
import moment from 'moment';

/**
 * Return Slack's message depending on reviews rating.
 *
 * @param review
 */
export const getSlackMessageTitleFromReview = (
  review: Review,
  app: string,
  os: string,
) => {
  let message = `Nouvel avis pour l'appli *${app}* (${os.toUpperCase()})`;
  if (review.score <= 1) {
    // we tagg canal if score is one... user need immediat help
    message = `${message}  🙏🏼 🆘`;
    // , <!channel> < si besoin de tagger canal
  }

  return message;
};

/**
 * Return Slack's color depending on review's score (red, orange or green).
 * @param review
 */
export const getSlackMessageColorFromReview = (review: Review) => {
  // vert
  let color = '#318532';
  switch (review.score) {
    case 1: {
      // rouge
      color = '#F73A11';
      break;
    }
    case 2: {
      // rouge
      color = '#F73A11';
      break;
    }
    case 3: {
      // orange
      color = '#EC9A2B';
      break;
    }
  }

  return color;
};

/**
 * Return Slack's message number of stars in a textual message, depending on review's score.
 * @param review
 */
export const getSlackMessageStarsTextFromReview = (review: Review) => {
  let starWord = 'étoile';
  if (review.score > 1) {
    starWord = 'étoiles';
  }

  return `*${review.score} ${starWord}* ${repeat('⭐', review.score)}`;
};

/**
 * Return's Slack's review text (depending if there is a title or not).
 * @param review
 */
export const getSlackMessageReviewText = (review: Review) => {
  let reviewText = `Le ${moment(review.date).format('DD/MM/YYYY à HH:MM')}`;

  reviewText = `${reviewText} \n\n ${review.text}`;
  if (review.title) {
    reviewText = `${review.title} \n\n ${reviewText}`;
  }

  return reviewText;
};
