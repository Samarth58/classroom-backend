import arcjet from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.ARCJET_KEY;

if (!key) {
  throw new Error(
    "ARCJET_KEY environment variable is missing or blank. Please set it in your .env file."
  );
}

const aj = arcjet({
  key,
  rules: [],
});

export default aj;