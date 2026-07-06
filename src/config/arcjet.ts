import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.ARCJET_KEY;
if (!key) {
  throw new Error("ARCJET_KEY environment variable is missing or blank. Please set it in your .env file.");
}

const aj = arcjet({
  key,
  rules: [
    // Add default rules here if needed, or configure dynamically in middleware
  ],
});

export default aj;
