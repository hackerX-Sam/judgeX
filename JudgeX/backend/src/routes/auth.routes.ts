import { Router } from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Local Registration
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, fullName, profilePic, country, institution, github, linkedin } = req.body;

    if (!email || !username || !password || !fullName) {
      return res.status(400).json({ error: 'Please provide email, username, password, and full name.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
        profilePic,
        country,
        institution,
        github,
        linkedin,
        provider: 'local'
      }
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Local Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.provider !== 'local' || !user.passwordHash) {
      return res.status(401).json({ error: 'Please login using your original provider.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initiate Google OAuth Flow
router.get('/google', (req, res, next) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith('unconfigured') || clientId.startsWith('mock')) {
    const errorMsg = encodeURIComponent('Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env');
    return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
  }

  passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' })(req, res, next);
});

// Google OAuth Callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      const errorMsg = encodeURIComponent(err?.message || info?.message || 'Google authentication failed or was cancelled.');
      return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    return res.redirect(`${FRONTEND_URL}/home?token=${token}`);
  })(req, res, next);
});

// Initiate GitHub OAuth Flow
router.get('/github', (req, res, next) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || clientId.startsWith('unconfigured') || clientId.startsWith('mock')) {
    const errorMsg = encodeURIComponent('GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env');
    return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
  }

  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

// GitHub OAuth Callback
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      const errorMsg = encodeURIComponent(err?.message || info?.message || 'GitHub authentication failed or was cancelled.');
      return res.redirect(`${FRONTEND_URL}/login?error=${errorMsg}`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    return res.redirect(`${FRONTEND_URL}/home?token=${token}`);
  })(req, res, next);
});

export default router;
