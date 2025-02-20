import request from 'supertest';
import { Express } from 'express';
import { setupTestServer } from '../testSetup';

describe('Character Data Controller', () => {
  let app: Express;

  beforeEach(async () => {
    app = await setupTestServer();
  });

  describe('PUT /character/:id', () => {
    const validCharacterData = {
      current_world_id: 1,
      health: 100,
      name: 'TestHero',
      gold: 500,
      attack: 10,
      appearance: 'warrior'
    };

    it('should update character data with valid auth', async () => {
      const response = await request(app)
        .put('/character/1')
        .set('Authorization', 'Bearer test-secret')
        .send(validCharacterData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Player data upserted successfully.'
      );
      expect(response.body).toHaveProperty('data');
    });

    it('should reject update without auth header', async () => {
      const response = await request(app)
        .put('/character/1')
        .send(validCharacterData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should reject update with invalid character data', async () => {
      const invalidData = {
        // Missing required fields
        name: 'TestHero'
      };

      const response = await request(app)
        .put('/character/1')
        .set('Authorization', 'Bearer test-secret')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields.');
    });
  });
});
