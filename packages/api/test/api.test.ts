import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('API', () => {
  describe('GET /', () => {
    it('should return service metadata', async () => {
      const res = await app.request('/');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.name).toBe('EtereCitizen API');
      expect(body.version).toBe('0.1.0');
    });
  });

  describe('GET /api/health', () => {
    it('should return ok status', async () => {
      const res = await app.request('/api/health');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.version).toBe('0.1.0');
      expect(body.timestamp).toBeTruthy();
    });
  });

  describe('GET /api/search', () => {
    it('should return search results (empty registry)', async () => {
      const res = await app.request('/api/search');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.agents).toBeDefined();
      expect(body.total).toBeDefined();
    });

    it('should accept query parameters', async () => {
      const res = await app.request('/api/search?capability=code-generation&minRating=3&limit=5');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.agents).toBeDefined();
    });
  });
});
