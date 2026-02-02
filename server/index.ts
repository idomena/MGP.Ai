import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import { generalLimiter } from "./middleware/rateLimiter";
import { configurePassport } from "./auth";
import passport from "passport";

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
