import * as firebase from 'firebase-admin';
import serviceAccountKey from './ServiceAccountKey.json';

const serviceAccount = serviceAccountKey as firebase.ServiceAccount;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://maiia-tech-tools.firebaseio.com',
});

export const db = firebase.firestore();

console.log('Firebase - database initiated');
