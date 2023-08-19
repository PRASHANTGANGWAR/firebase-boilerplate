import * as admin from 'firebase-admin';
const config = {
  credential: admin.credential.cert(
    '/home/anuj/Desktop/nest-firestore/privatekeys/firebase-adminsdk.json',
  ),
};
const fireApp = admin.initializeApp(config, 'firebaseInstance1');
export default fireApp;
