import express from "express";
import subjectRouter from "./routes/subjects";
import cors from "cors";
const app = express();
const PORT = 8000;

app.use(cors({
  origin:process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json());

app.use('/api/subjects', subjectRouter);

app.get('/', (req, res) => {
  res.send('Hello, Welcome to the Classroom Backend API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});