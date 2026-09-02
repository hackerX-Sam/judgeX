import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'unconfigured_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'unconfigured_google_client_secret',
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value || '';
        const fullName = profile.displayName || 'Google User';
        const profilePic = profile.photos?.[0]?.value || '';

        // 1. Search for existing user by providerId & provider
        let user = await prisma.user.findFirst({
          where: { providerId, provider: 'google' }
        });

        // 2. If not found by providerId, check if account exists with matching email
        if (!user && email) {
          const existingEmailUser = await prisma.user.findUnique({ where: { email } });
          if (existingEmailUser) {
            console.log(`[Google Auth] Linking existing account for email: ${email}`);
            user = await prisma.user.update({
              where: { id: existingEmailUser.id },
              data: {
                provider: 'google',
                providerId: providerId,
                profilePic: existingEmailUser.profilePic || profilePic,
              }
            });
            return done(null, user);
          }
        }

        // 3. If user still doesn't exist, create a new user account
        if (!user) {
          // Generate a clean, unique username
          const baseUsername = email 
            ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
            : `google_${providerId.substring(0, 8)}`;
          
          let username = baseUsername;
          let counter = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email: email || `google_${providerId}@judgex.local`,
              username,
              fullName,
              profilePic,
              provider: 'google',
              providerId: providerId,
            }
          });
          console.log(`[Google Auth] Created new user: ${user.username} (${user.email})`);
        } else {
          console.log(`[Google Auth] Successfully authenticated user: ${user.username}`);
        }

        return done(null, user);
      } catch (error) {
        console.error('[Google Auth Error]:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'unconfigured_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'unconfigured_github_client_secret',
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const providerId = profile.id.toString();
        const email = profile.emails?.[0]?.value || '';
        const fullName = profile.displayName || profile.username || 'GitHub User';
        const profilePic = profile.photos?.[0]?.value || profile._json?.avatar_url || '';

        // 1. Search for existing user by providerId & provider
        let user = await prisma.user.findFirst({
          where: { providerId, provider: 'github' }
        });

        // 2. If not found by providerId, check if account exists with matching email
        if (!user && email) {
          const existingEmailUser = await prisma.user.findUnique({ where: { email } });
          if (existingEmailUser) {
            console.log(`[GitHub Auth] Linking existing account for email: ${email}`);
            user = await prisma.user.update({
              where: { id: existingEmailUser.id },
              data: {
                provider: 'github',
                providerId: providerId,
                profilePic: existingEmailUser.profilePic || profilePic,
                github: existingEmailUser.github || profile.profileUrl || `https://github.com/${profile.username}`,
              }
            });
            return done(null, user);
          }
        }

        // 3. If user still doesn't exist, create a new user account
        if (!user) {
          const baseUsername = profile.username || (email ? email.split('@')[0] : `github_${providerId}`);
          let username = baseUsername.replace(/[^a-zA-Z0-9_]/g, '');
          let counter = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email: email || `github_${providerId}@judgex.local`,
              username,
              fullName,
              profilePic,
              github: profile.profileUrl || `https://github.com/${profile.username}`,
              provider: 'github',
              providerId: providerId,
            }
          });
          console.log(`[GitHub Auth] Created new user: ${user.username} (${user.email})`);
        } else {
          console.log(`[GitHub Auth] Successfully authenticated user: ${user.username}`);
        }

        return done(null, user);
      } catch (error) {
        console.error('[GitHub Auth Error]:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
