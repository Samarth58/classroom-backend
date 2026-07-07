import express from "express";
import cors from "cors";
import subjectRouter from "./routes/subjects.js";
import securityMiddleWare from "./middleware/security.js";

export const app = express();

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is not set");
}

// CORS
const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = [process.env.FRONTEND_URL];
if (isDev) {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://localhost:3000");
  allowedOrigins.push("http://127.0.0.1:5173");
  allowedOrigins.push("http://127.0.0.1:3000");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Body parsing
app.use(express.json());

// Security middleware (Arcjet)
app.use(securityMiddleWare);

// Routes
app.use("/api/subjects", subjectRouter);

app.get("/", (req, res) => {
  res.send("Hello, Welcome to the Classroom Backend API!");
});

