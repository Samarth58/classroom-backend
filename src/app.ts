import express from "express";
import cors from "cors";
import subjectRouter from "./routes/subjects.js";
import userRouter from "./routes/users.js";
import securityMiddleWare from "./middleware/security.js";
import classRouter from "./routes/classes.js";

const app = express();

const frontendUrl = process.env.FRONTEND_URL?.trim();

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");
const isVercelOrigin = (value: string) => /\.vercel\.app$/i.test(value);
const isLocalOrigin = (value: string) =>
  value.startsWith("http://localhost") ||
  value.startsWith("http://127.0.0.1") ||
  value.startsWith("https://localhost") ||
  value.startsWith("https://127.0.0.1");

const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = [] as string[];

if (frontendUrl) {
  allowedOrigins.push(normalizeOrigin(frontendUrl));
}

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

allowedOrigins.push(...envAllowedOrigins);

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

      const normalizedOrigin = normalizeOrigin(origin);

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        isVercelOrigin(normalizedOrigin) ||
        isLocalOrigin(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200,
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
