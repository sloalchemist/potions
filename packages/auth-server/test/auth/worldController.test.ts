import { Express } from 'express';
import { setupTestServer } from '../testSetup';
import request from 'supertest';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('World Controller', () => {
  let app: Express;

  beforeEach(async () => {
    app = await setupTestServer();
  });

  describe('GET /worlds', () => {
    it('should return worlds list with valid auth', async () => {
      const response = await request(app)
        .get('/worlds')
        .set('Authorization', 'Bearer test-secret');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject request without auth header', async () => {
      const response = await request(app).get('/worlds');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
