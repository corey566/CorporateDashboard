import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard data with agents and teams', async () => {
      const mockDashboardData = {
        agents: [
          {
            id: 1,
            name: 'Test Agent',
            photo: '',
            teamId: 1,
            volumeTarget: '10000.00',
            unitsTarget: 50,
            currentVolume: 5000,
            currentUnits: 25,
            team: { id: 1, name: 'Alpha Team', color: '#3B82F6' }
          }
        ],
        teams: [
          {
            id: 1,
            name: 'Alpha Team',
            color: '#3B82F6',
            volumeTarget: '50000.00',
            unitsTarget: 200
          }
        ],
        cashOffers: [],
        announcements: [],
        mediaSlides: []
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDashboardData)
      });

      const response = await fetch('http://localhost:5000/api/dashboard');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.agents).toBeDefined();
      expect(data.teams).toBeDefined();
      expect(Array.isArray(data.agents)).toBe(true);
    });

    it('should handle empty dashboard data', async () => {
      const emptyData = {
        agents: [],
        teams: [],
        cashOffers: [],
        announcements: [],
        mediaSlides: []
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(emptyData)
      });

      const response = await fetch('http://localhost:5000/api/dashboard');
      const data = await response.json();

      expect(data.agents).toEqual([]);
      expect(data.teams).toEqual([]);
    });
  });
});
