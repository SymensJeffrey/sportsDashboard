import express from 'express';

const app = express();
const PORT = 8000;

// middleware
app.use(express.json());

// root route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express server!' });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
