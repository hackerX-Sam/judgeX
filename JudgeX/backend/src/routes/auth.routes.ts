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

// Init Google Login
router.get('/google', (req, res, next) => {
  if (process.env.GOOGLE_CLIENT_ID === 'mock_google_client_id' || !process.env.GOOGLE_CLIENT_ID) {
    // If we don't have real credentials, simulate the callback for development purposes
    return res.redirect('/api/auth/google/callback?simulated=true');
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// Google Callback
router.get('/google/callback', 
  (req, res, next) => {
    // Simulated path for quick local testing without setting up GCP credentials
    if (req.query.simulated === 'true') {
      const mockToken = jwt.sign({ id: 'mock123', email: 'mock@example.com' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.redirect(`${FRONTEND_URL}/home?token=${mockToken}`);
    }
    
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=true` })(req, res, next);
  },
  (req, res) => {
    // Successful authentication
    const user: any = req.user;
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/home?token=${token}`);
  }
);

// Init GitHub Login
router.get('/github', (req, res, next) => {
  if (process.env.GITHUB_CLIENT_ID === 'mock_github_client_id' || !process.env.GITHUB_CLIENT_ID) {
    return res.redirect('/api/auth/github/callback?simulated=true');
  }
  
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

// GitHub Callback
router.get('/github/callback', 
  (req, res, next) => {
    if (req.query.simulated === 'true') {
      const mockToken = jwt.sign({ id: 'mock456', email: 'mock_github@example.com' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.redirect(`${FRONTEND_URL}/home?token=${mockToken}`);
    }
    
    passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=true` })(req, res, next);
  },
  (req, res) => {
    const user: any = req.user;
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );
    res.redirect(`${FRONTEND_URL}/home?token=${token}`);
  }
);

export default router;
