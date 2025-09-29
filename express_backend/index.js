const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const Minio = require('minio');

// Initialize Express app
const app = express();

// Initialize Firebase Admin SDK
// Make sure to set up your service account credentials properly
// For example, by setting the GOOGLE_APPLICATION_CREDENTIALS environment variable
admin.initializeApp();

// Initialize MinIO client
// Make sure to configure your MinIO connection details
const minioClient = new Minio.Client({
  endPoint: 'YOUR_MINIO_ENDPOINT', // Replace with your MinIO endpoint
  port: 9000,
  useSSL: false,
  accessKey: 'YOUR_MINIO_ACCESS_KEY', // Replace with your MinIO access key
  secretKey: 'YOUR_MINIO_SECRET_KEY', // Replace with your MinIO secret key
});

// Firebase token middleware (placeholder)
const firebaseAuthMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).send('Unauthorized');
  }
};

// Set up Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Blob upload endpoint
app.post('/upload', firebaseAuthMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { buffer, originalname, mimetype } = req.file;
  const bucketName = 'my-bucket'; // Replace with your MinIO bucket name
  const objectName = `${Date.now()}-${originalname}`;

  try {
    // Check if the bucket exists, and create it if it doesn't
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Upload the file to MinIO
    await minioClient.putObject(bucketName, objectName, buffer, {
      'Content-Type': mimetype,
    });

    res.status(200).send({ message: 'File uploaded successfully', objectName });
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    res.status(500).send('Error uploading file.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
