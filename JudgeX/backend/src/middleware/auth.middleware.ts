import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabaseClient';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid format. Expected Bearer token.' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Try decoding local signed JWT token first
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded && decoded.id) {
        req.user = decoded;
        return next();
      }
    } catch (_jwtErr) {}

    // 2. Try Supabase Auth token if JWT verification failed
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) {
        req.user = user;
        return next();
      }
    } catch (_supabaseErr) {}

    return res.status(401).json({ error: 'Invalid or expired auth session token.' });
  } catch (error: any) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
};
