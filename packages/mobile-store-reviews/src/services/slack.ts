import { OS, UserType } from '../util/constants';
// import { WebClient } from '@slack/web-api';
import { keys } from '../config/keys';
import repeat from 'lodash/repeat';
import { Review } from '../models/Review';
import { IncomingWebhook } from '@slack/webhook';
import {
  getSlackMessageColorFromReview,
  getSlackMessageTitleFromReview,
  getSlackMessageStarsTextFromReview,
  getSlackMessageReviewText,
} from '../util/slack-reviews-formatting';

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const url = keys.SLACK_HOOK_MOBILE_APP_REVIEWS;
const urlMobileTech = keys.SLACK_HOOK_MOBILE_TECH;
const urlPoEditor = keys.SLACK_HOOK_PO_EDITOR;

// const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
// const channel = keys.SLACK_CHANNEL;

const webhook = new IncomingWebhook(url);

export class Slack {
  async slackSendPoEditorChanges(text: string) {
    const hook = new IncomingWebhook(urlPoEditor);
    await hook.send({
      text: '',
      attachments: [
        {
          color: '#41eab3', // couleur de PO editor ;)
          fallback: text,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: text,
              },
            },
            {
              type: 'divider',
            },
          ],
        },
      ],
    });
  }

  async slackSendReview(review: Review, os: OS, userType: UserType) {
    const app = userType === UserType.Pat ? 'patient 🤒️' : 'pro 🤓️';
    const user = review.userName;

    // formatting Slack message
    const message = getSlackMessageTitleFromReview(review, app, os);
    const color = getSlackMessageColorFromReview(review);
    const stars = getSlackMessageStarsTextFromReview(review);
    const reviewText = getSlackMessageReviewText(review);

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: user + '\n ' + stars,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: reviewText,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Lien',
            },
            url: review.url,
          },
        ],
      },
    ];

    console.log('[INFO] Posting Slack message', message, blocks);

    await webhook.send({
      text: message,
      attachments: [
        {
          color,
          fallback: message,
          blocks,
        },
      ],
    });
  }
}
