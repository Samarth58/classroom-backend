import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.ARCJET_KEY;

// Allow local/dev startup without configuring Arcjet.
// In production you should set ARCJET_KEY.
const aj = key
  ? arcjet({
      key,
      rules: [
        // Add default rules here if needed, or configure dynamically in middleware
      ],
    })
  : null;

export default aj;

