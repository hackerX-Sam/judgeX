import { Router } from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { supabaseAdmin } from '../config/supabaseClient';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initiate Live Google OAuth Flow
router.get('/google', (req, res, next) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith('unconfigured')) {
    const errorMsg = encodeURIComponent('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in backend/.env');
    return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
  }

  passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' })(req, res, next);
});

// Live Google OAuth Callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      const errorMsg = encodeURIComponent(err?.message || info?.message || 'Google authentication failed or was cancelled.');
      return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    return res.redirect(`${FRONTEND_URL}/home?token=${token}`);
  })(req, res, next);
});

// Initiate Live GitHub OAuth Flow
router.get('/github', (req, res, next) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || clientId.startsWith('unconfigured') || clientId.startsWith('mock')) {
    const errorMsg = encodeURIComponent('GitHub OAuth Client ID is set to mock. Please set a valid GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env to connect to live GitHub.');
    return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
  }

  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

// Live GitHub OAuth Callback
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      const errorMsg = encodeURIComponent(err?.message || info?.message || 'GitHub authentication failed or was cancelled.');
      return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    return res.redirect(`${FRONTEND_URL}/home?token=${token}`);
  })(req, res, next);
});

// Sync user from Supabase Auth to Prisma Database
router.post('/sync', requireAuth, async (req: AuthenticatedRequest, res): Promise<any> => {
  try {
    const supabaseUser = req.user;
    const { fullName, profilePic, country, institution, github, linkedin } = req.body;

    const email = supabaseUser.email;
    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const username = supabaseUser.user_metadata?.username || 
                     email.split('@')[0] + '_' + supabaseUser.id.substring(0, 5);

    const user = await prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {
        email,
        username,
        fullName: fullName || supabaseUser.user_metadata?.full_name || username,
        profilePic: profilePic || supabaseUser.user_metadata?.avatar_url || null,
        country: country || undefined,
        institution: institution || undefined,
        github: github || undefined,
        linkedin: linkedin || undefined,
      },
      create: {
        id: supabaseUser.id,
        email,
        username,
        fullName: fullName || supabaseUser.user_metadata?.full_name || username,
        profilePic: profilePic || supabaseUser.user_metadata?.avatar_url || null,
        country: country || null,
        institution: institution || null,
        github: github || null,
        linkedin: linkedin || null,
        provider: supabaseUser.app_metadata?.provider || 'supabase',
        providerId: supabaseUser.id,
      }
    });

    return res.status(200).json({ message: 'User synchronized successfully', user });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Internal Server Error during user sync' });
  }
});

// Get current authenticated user profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
