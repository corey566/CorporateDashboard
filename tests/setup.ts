import '@testing-library/jest-dom';
import { vi } from 'vitest';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.NODE_ENV = 'test';
