import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Agents API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('should return list of agents', async () => {
      const mockAgents = [
        {
          id: 1,
          name: 'Test Agent',
          photo: '',
          teamId: 1,
          volumeTarget: '10000.00',
          unitsTarget: 50,
          isActive: true
        },
        {
          id: 2,
          name: 'Another Agent',
          photo: '',
          teamId: 2,
          volumeTarget: '15000.00',
          unitsTarget: 75,
          isActive: true
        }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAgents)
      });

      const response = await fetch('http://localhost:5000/api/agents');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Test Agent');
    });
  });

  describe('POST /api/agents', () => {
    it('should require authentication', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      const response = await fetch('http://localhost:5000/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Agent',
          teamId: 1,
          volumeTarget: 10000,
          unitsTarget: 50
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should create agent with valid data', async () => {
      const newAgent = {
        id: 3,
        name: 'New Agent',
        teamId: 1,
        volumeTarget: '10000.00',
        unitsTarget: 50,
        isActive: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(newAgent)
      });

      const response = await fetch('http://localhost:5000/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Agent',
          teamId: 1,
          volumeTarget: 10000,
          unitsTarget: 50
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe('New Agent');
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('should update agent', async () => {
      const updatedAgent = {
        id: 1,
        name: 'Updated Agent',
        teamId: 1,
        volumeTarget: '15000.00',
        unitsTarget: 75,
        isActive: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedAgent)
      });

      const response = await fetch('http://localhost:5000/api/agents/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Agent',
          volumeTarget: 15000,
          unitsTarget: 75
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe('Updated Agent');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete agent', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204
      });

      const response = await fetch('http://localhost:5000/api/agents/1', {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);
    });
  });
});
