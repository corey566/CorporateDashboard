import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.fetch = vi.fn();

vi.mock('ws', () => ({
  WebSocket: vi.fn(),
  WebSocketServer: vi.fn()
}));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.NODE_ENV = 'test';
