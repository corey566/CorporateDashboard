import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Sales API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/sales', () => {
    it('should return list of sales', async () => {
      const mockSales = [
        {
          id: 1,
          agentId: 1,
          volume: '1000.00',
          units: 5,
          category: 'Software',
          createdAt: new Date().toISOString()
        }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSales)
      });

      const response = await fetch('http://localhost:5000/api/sales');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /api/sales', () => {
    it('should require authentication', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 1,
          volume: 1000,
          units: 5
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should create sale with valid data', async () => {
      const newSale = {
        id: 2,
        agentId: 1,
        volume: '2000.00',
        units: 10,
        createdAt: new Date().toISOString()
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(newSale)
      });

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 1,
          volume: 2000,
          units: 10
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.agentId).toBe(1);
    });
  });

  describe('DELETE /api/sales/:id', () => {
    it('should delete sale', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204
      });

      const response = await fetch('http://localhost:5000/api/sales/1', {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
    });
  });
});
