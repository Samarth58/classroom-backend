declare global {
  type RateLimitRole = 'admin' | 'teacher' | 'student' | 'guest';

  namespace Express {
    interface Request {
      user?: {
        role?: RateLimitRole;
      };
    }
  }
}
export {};
