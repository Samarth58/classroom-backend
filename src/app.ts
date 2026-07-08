import express from "express";
import cors from "cors";
import subjectRouter from "./routes/subjects.js";
import userRouter from "./routes/users.js";
import securityMiddleWare from "./middleware/security.js";
import classRouter from "./routes/classes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(securityMiddleWare);

app.use("/api/subjects", subjectRouter);
app.use("/api/users", userRouter);
app.use("/api/classes", classRouter);

app.get("/", (_req, res) => {
  res.send("Hello, Welcome to the Classroom Backend API!");
});

export default app;
