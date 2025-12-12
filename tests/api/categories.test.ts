import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return list of categories', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Software',
          color: '#3B82F6',
          description: 'Software products',
          isActive: true
        },
        {
          id: 2,
          name: 'Hardware',
          color: '#10B981',
          description: 'Hardware products',
          isActive: true
        }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      });

      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Software');
    });
  });

  describe('POST /api/categories', () => {
    it('should require authentication', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Category',
          color: '#FF5733'
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should create category with valid data', async () => {
      const newCategory = {
        id: 3,
        name: 'New Category',
        color: '#FF5733',
        description: 'New category description',
        isActive: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(newCategory)
      });

      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Category',
          color: '#FF5733',
          description: 'New category description'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe('New Category');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category', async () => {
      const updatedCategory = {
        id: 1,
        name: 'Updated Category',
        color: '#3B82F6',
        description: 'Updated description',
        isActive: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedCategory)
      });

      const response = await fetch('http://localhost:5000/api/categories/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Category',
          description: 'Updated description'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.name).toBe('Updated Category');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204
      });

      const response = await fetch('http://localhost:5000/api/categories/1', {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
    });
  });
});
