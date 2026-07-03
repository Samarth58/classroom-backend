import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hello World" });
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

app.use((req, _res, next) => {
  console.log(req.url);
  next();
});


