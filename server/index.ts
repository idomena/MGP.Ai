import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import { generalLimiter } from "./middleware/rateLimiter";
import { configurePassport } from "./auth";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3001);

// Trust proxy for Replit environment
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(",") || true
    : true,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'mgp-ai-session-secret-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(requestLogger);

app.use(generalLimiter);

app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/auth/logout', (req: any, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

app.get('/auth/user', (req: any, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Only serve index.html for non-API GET requests
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
