import type { Request, Response, NextFunction } from "express";
import aj from '../config/arcjet.js';
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";
const securityMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test") {
        return next();

        try {
            const role: RateLimitRole = req.user?.role ?? 'guest';

            let limit: number;
            let message: string;

            switch (role) {
                case 'admin':
                    limit = 20;
                    message = 'Admin request limit exceeded (20 per minute)';
                    break;
                case 'teacher':
                case 'student':
                    limit = 10;
                    message = 'user request limit exceeded (10 per minute)';
                    break;
                default:
                    limit = 5;
                    message = "guest request limit exceeded (5 per minute) please signup for higher limit"
                    break;
            }
            const client = aj.withRule(
                slidingWindow({
                    mode: 'LIVE',
                    interval: '1m',
                    max: limit,
                })
            );

            const arcjetRequest: ArcjetNodeRequest = {
                headers: req.headers,
                method: req.method,
                url: req.originalUrl ?? req.url,
                socket: { remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0' },

            }
        } catch (e) {
            console.error("Security middleware error", e);
            return res.status(500).json({ error: "Internal error", message: "Something went wrong with security middleWare" })
        }

    }
}