
import express from 'express';
import multer from 'multer';
import { firebaseAuth } from './middleware/auth';
import { minioClient } from './storage';

const app = express();
const port = 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/personal/meta', firebaseAuth, (req, res) => {
  res.send({ message: `Hello ${req.user.email}`});
});

app.post('/personal/upload', firebaseAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  const bucketName = process.env.MINIO_BUCKET || 'mydatagpt';
  const objectName = `${req.user.uid}/${req.file.originalname}`;

  try {
    await minioClient.putObject(bucketName, objectName, req.file.buffer, req.file.size);
    res.send({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to upload file' });
  }
});

app.listen(port, async () => {
  const bucketName = process.env.MINIO_BUCKET || 'mydatagpt';
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} created.`);
    }
  } catch (err) {
    console.error('Error creating bucket:', err);
  }
  console.log(`Server is running on port ${port}`);
});
