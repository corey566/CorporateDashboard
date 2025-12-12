import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Teams API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/teams', () => {
    it('should return list of teams', async () => {
      const mockTeams = [
        {
          id: 1,
          name: 'Alpha Team',
          color: '#3B82F6',
          volumeTarget: '50000.00',
          unitsTarget: 200,
          targetCycle: 'monthly'
        },
        {
          id: 2,
          name: 'Beta Team',
          color: '#10B981',
          volumeTarget: '40000.00',
          unitsTarget: 150,
          targetCycle: 'monthly'
        }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTeams)
      });

      const response = await fetch('http://localhost:5000/api/teams');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Alpha Team');
    });
  });

  describe('POST /api/teams', () => {
    it('should require authentication', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Team',
          color: '#FF5733',
          volumeTarget: 30000,
          unitsTarget: 100
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should create team with valid data', async () => {
      const newTeam = {
        id: 3,
        name: 'New Team',
        color: '#FF5733',
        volumeTarget: '30000.00',
        unitsTarget: 100,
        targetCycle: 'monthly'
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(newTeam)
      });

      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Team',
          color: '#FF5733',
          volumeTarget: 30000,
          unitsTarget: 100
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe('New Team');
    });
  });

  describe('PUT /api/teams/:id', () => {
    it('should update team', async () => {
      const updatedTeam = {
        id: 1,
        name: 'Updated Team',
        color: '#3B82F6',
        volumeTarget: '60000.00',
        unitsTarget: 250
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedTeam)
      });

      const response = await fetch('http://localhost:5000/api/teams/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Team',
          volumeTarget: 60000,
          unitsTarget: 250
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe('Updated Team');
    });
  });

  describe('DELETE /api/teams/:id', () => {
    it('should delete team', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204
      });

      const response = await fetch('http://localhost:5000/api/teams/1', {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);
    });
  });
});
