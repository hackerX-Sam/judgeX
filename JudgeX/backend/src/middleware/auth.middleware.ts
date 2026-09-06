import { Request, Response, NextFunction } from 'express';
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
    
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired auth session token.' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
};
