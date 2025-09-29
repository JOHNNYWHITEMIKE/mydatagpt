
import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello from the chatgpt backend!');
});

app.listen(port, () => {
  console.log(`ChatGPT backend listening at http://localhost:${port}`);
});
