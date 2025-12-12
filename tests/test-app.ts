import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

export function createTestApp() {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: number, done) => {
    done(null, { id, username: 'testuser' });
  });
  
  passport.use(new LocalStrategy((username, password, done) => {
    if (username === 'admin' && password === 'admin123') {
      return done(null, { id: 1, username: 'admin' });
    }
    return done(null, false);
  }));

  return app;
}

export const mockStorage = {
  agents: [
    {
      id: 1,
      name: 'Test Agent',
      photo: '',
      teamId: 1,
      categoryId: null,
      category: 'Mixed',
      volumeTarget: '10000.00',
      unitsTarget: 50,
      targetCycle: 'monthly',
      resetDay: 1,
      resetMonth: 1,
      isActive: true,
      username: null,
      password: null,
      canSelfReport: false,
      createdAt: new Date().toISOString(),
      currentVolume: 5000,
      currentUnits: 25
    }
  ],
  teams: [
    {
      id: 1,
      name: 'Alpha Team',
      color: '#3B82F6',
      volumeTarget: '50000.00',
      unitsTarget: 200,
      targetCycle: 'monthly',
      resetDay: 1,
      resetMonth: 1,
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: 1,
      name: 'Software',
      color: '#3B82F6',
      description: 'Software products',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  sales: [],
  cashOffers: [],
  announcements: [],
  mediaSlides: []
};
