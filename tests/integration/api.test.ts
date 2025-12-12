import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestApp, mockStorage } from '../test-app';

describe('API Integration Tests', () => {
  let app: express.Express;
  
  beforeEach(() => {
    app = createTestApp();
    
    app.get('/api/dashboard', (req, res) => {
      res.json({
        agents: mockStorage.agents.map(agent => ({
          ...agent,
          team: mockStorage.teams.find(t => t.id === agent.teamId)
        })),
        teams: mockStorage.teams,
        cashOffers: mockStorage.cashOffers,
        announcements: mockStorage.announcements,
        mediaSlides: mockStorage.mediaSlides
      });
    });
    
    app.get('/api/agents', (req, res) => {
      res.json(mockStorage.agents);
    });
    
    app.post('/api/agents', (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const newAgent = {
        id: mockStorage.agents.length + 1,
        ...req.body,
        createdAt: new Date().toISOString(),
        currentVolume: 0,
        currentUnits: 0
      };
      mockStorage.agents.push(newAgent);
      res.status(201).json(newAgent);
    });
    
    app.get('/api/teams', (req, res) => {
      res.json(mockStorage.teams);
    });
    
    app.post('/api/teams', (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const newTeam = {
        id: mockStorage.teams.length + 1,
        ...req.body,
        createdAt: new Date().toISOString()
      };
      mockStorage.teams.push(newTeam);
      res.status(201).json(newTeam);
    });
    
    app.get('/api/categories', (req, res) => {
      res.json(mockStorage.categories);
    });
    
    app.post('/api/categories', (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const newCategory = {
        id: mockStorage.categories.length + 1,
        ...req.body,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      mockStorage.categories.push(newCategory);
      res.status(201).json(newCategory);
    });
  });

  describe('Dashboard Endpoint', () => {
    it('GET /api/dashboard should return dashboard data', async () => {
      const response = await request(app).get('/api/dashboard');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agents');
      expect(response.body).toHaveProperty('teams');
      expect(Array.isArray(response.body.agents)).toBe(true);
      expect(Array.isArray(response.body.teams)).toBe(true);
    });

    it('GET /api/dashboard should include agent with team data', async () => {
      const response = await request(app).get('/api/dashboard');
      
      expect(response.status).toBe(200);
      expect(response.body.agents[0]).toHaveProperty('team');
      expect(response.body.agents[0].team.name).toBe('Alpha Team');
    });
  });

  describe('Agents Endpoints', () => {
    it('GET /api/agents should return list of agents', async () => {
      const response = await request(app).get('/api/agents');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].name).toBe('Test Agent');
    });

    it('POST /api/agents should require authentication', async () => {
      const response = await request(app)
        .post('/api/agents')
        .send({ name: 'New Agent', teamId: 1 });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Teams Endpoints', () => {
    it('GET /api/teams should return list of teams', async () => {
      const response = await request(app).get('/api/teams');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].name).toBe('Alpha Team');
    });

    it('POST /api/teams should require authentication', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({ name: 'New Team', color: '#FF5733' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Categories Endpoints', () => {
    it('GET /api/categories should return list of categories', async () => {
      const response = await request(app).get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].name).toBe('Software');
    });

    it('POST /api/categories should require authentication', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'New Category', color: '#FF5733' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Response Structure Validation', () => {
    it('Dashboard agents should have required fields', async () => {
      const response = await request(app).get('/api/dashboard');
      const agent = response.body.agents[0];
      
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('teamId');
      expect(agent).toHaveProperty('volumeTarget');
      expect(agent).toHaveProperty('unitsTarget');
      expect(agent).toHaveProperty('currentVolume');
      expect(agent).toHaveProperty('currentUnits');
    });

    it('Teams should have required fields', async () => {
      const response = await request(app).get('/api/teams');
      const team = response.body[0];
      
      expect(team).toHaveProperty('id');
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('color');
      expect(team).toHaveProperty('volumeTarget');
      expect(team).toHaveProperty('unitsTarget');
    });

    it('Categories should have required fields', async () => {
      const response = await request(app).get('/api/categories');
      const category = response.body[0];
      
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('color');
      expect(category).toHaveProperty('isActive');
    });
  });
});
