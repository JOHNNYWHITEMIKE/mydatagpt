import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  const serviceAccount = require('../mydatagpt-ee047-firebase-adminsdk-fbsvc-4584263bfa.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).send({ error: 'Missing token' });
  }
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).send({ error: 'Invalid token' });
  }
}
