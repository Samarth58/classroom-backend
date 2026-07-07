import type { IncomingMessage, ServerResponse } from "http";
import { app as expressApp } from "../src/app.js";

// Vercel serverless handler. We must not call app.listen().
// We forward the request to the existing Express app.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Ensure the Express app is callable
  const app = (expressApp as unknown as { app?: any; default?: any }).app ?? expressApp;

  return new Promise<void>((resolve, reject) => {
    app(req, res, (err: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

