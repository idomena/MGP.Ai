import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from './supabase';

export const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  console.log('Google OAuth Config:');
  console.log('- Client ID exists:', !!clientID);
  console.log('- Client ID length:', clientID?.length || 0);
  console.log('- Client ID preview:', clientID?.substring(0, 20) + '...');
  console.log('- Client Secret exists:', !!clientSecret);
  
  if (!clientID || !clientSecret) {
    console.error('Missing Google OAuth credentials!');
    return;
  }
  
  const callbackURL = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/auth/google/callback`
    : "/auth/google/callback";
  
  console.log('- Callback URL:', callbackURL);
  
  passport.use(new GoogleStrategy({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        const { data: existingUser, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('google_id', googleId)
          .single();

        if (existingUser) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('profiles')
            .update({ 
              last_login: new Date().toISOString(),
              avatar_url: avatarUrl 
            })
            .eq('google_id', googleId)
            .select()
            .single();

          if (updateError) throw updateError;
          return done(null, updatedUser);
        } else {
          const { data: newUser, error: insertError } = await supabase
            .from('profiles')
            .insert({
              google_id: googleId,
              email: email,
              full_name: fullName,
              avatar_url: avatarUrl,
              last_login: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) throw insertError;
          return done(null, newUser);
        }
      } catch (err) {
        console.error('Error in Google OAuth:', err);
        return done(err as Error, undefined);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  return passport;
};

export default passport;
