import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_client_secret',
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await prisma.user.findFirst({
          where: { providerId: profile.id, provider: 'google' }
        });

        if (!user) {
          // Check if email already exists with different provider
          const email = profile.emails?.[0].value;
          if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
              console.log('Google Auth: Email already exists. Logging in as existing user.');
              return done(null, existingUser);
            }
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value || '',
              username: `user_${profile.id}`,
              fullName: profile.displayName,
              profilePic: profile.photos?.[0].value,
              provider: 'google',
              providerId: profile.id
            }
          });
        }
        
        console.log('Google Auth Success for user:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('Google Auth Error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'mock_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock_github_client_secret',
      callbackURL: 'http://localhost:3000/api/auth/github/callback',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await prisma.user.findFirst({
          where: { providerId: profile.id, provider: 'github' }
        });

        if (!user) {
          const email = profile.emails?.[0].value;
          if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
              console.log('GitHub Auth: Email already exists. Logging in as existing user.');
              return done(null, existingUser);
            }
          }

          user = await prisma.user.create({
            data: {
              email: email || '',
              username: profile.username || `user_${profile.id}`,
              fullName: profile.displayName || profile.username || 'GitHub User',
              profilePic: profile.photos?.[0].value,
              provider: 'github',
              providerId: profile.id
            }
          });
        }
        
        console.log('GitHub Auth Success for user:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('GitHub Auth Error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
