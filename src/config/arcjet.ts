import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

const aj = arcjet({
  key: process.env.ARCJET_KEY || "", // Make sure to set ARCJET_KEY in your .env file
  rules: [
    // Add default rules here if needed, or configure dynamically in middleware
  ],
});

export default aj;
