import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_4Gbw8jkE-qy87vSL8SpxNLxMvD-QDsk",
  authDomain: "morozovssmbot.firebaseapp.com",
  databaseURL: "https://morozovssmbot-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "morozovssmbot",
  storageBucket: "morozovssmbot.firebasestorage.app",
  messagingSenderId: "561592430954",
  appId: "1:561592430954:web:267a085ef051be622f7513"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('MOROZOV SMM SERVER IS RUNNING');
    res.status(200).json({ ok: true });
}
