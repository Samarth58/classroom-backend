import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.get("/", (_req, res) => {
  res.send("Railway backend is working!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});