import * as firebase from 'firebase-admin';
import { Review } from '../models/Review';
import { db } from '../services/firebase';
import { OS, UserType } from '../util/constants';

const lastReviewsDates = db.collection('last_reviews');

export class ApiReview {
  /**
   * An other way to get the last review date in database.
   * Eg. we store a field pat_ios = timestamp.
   *
   * @param os
   * @param userType
   */
  static async getLastReviewTimestamp(os: OS, userType: UserType) {
    try {
      const snapshot = await lastReviewsDates
        .where('id', '==', userType + '_' + os)
        .limit(1)
        .get();

      return snapshot.docs[0].data();
    } catch (e) {
      return null;
    }
  }

  /**
   * Insére ou met à jour la dernière date de review en base.
   * @param review
   */
  static insertOrUpdate(
    os: OS,
    userType: UserType,
    review: Review,
  ): Promise<FirebaseFirestore.WriteResult[]> {
    const batch = db.batch();
    const uniqueId = userType + '_' + os;

    try {
      console.log('[INFO] Trying to insert review in Firebase : ', uniqueId);

      const docRef = lastReviewsDates.doc(uniqueId);
      batch.set(docRef, {
        ...review,
        date: new Date(review.date).getTime(),
        dateAsString: new Date(review.date),
        insertedAt: firebase.firestore.FieldValue.serverTimestamp(),
        idOnStore: review.id,
        id: uniqueId,
      });

      return batch.commit();
    } catch (e) {
      console.log('Firebase error', e);
      return null;
    }
  }
}
