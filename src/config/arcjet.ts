import arcjet from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.ARCJET_KEY?.trim();

const aj = key
  ? arcjet({
      key,
      rules: [],
    })
  : null;

export default aj;