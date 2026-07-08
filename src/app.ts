import express from "express";
import cors from "cors";
import subjectRouter from "./routes/subjects.js";
import userRouter from "./routes/users.js";
import securityMiddleWare from "./middleware/security.js";
import classRouter from "./routes/classes.js";

const app = express();

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is not set");
}

const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = [process.env.FRONTEND_URL];

if (isDev) {
  allowedOrigins.push("https://classroom-frontend-three-psi.vercel.app");
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://localhost:3000");
  allowedOrigins.push("http://127.0.0.1:5173");
  allowedOrigins.push("http://127.0.0.1:3000");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(securityMiddleWare);

app.use("/api/subjects", subjectRouter);
app.use("/api/users", userRouter);
app.use("/api/classes", classRouter);

app.get("/", (_req, res) => {
  res.send("Hello, Welcome to the Classroom Backend API!");
});

export default app;
