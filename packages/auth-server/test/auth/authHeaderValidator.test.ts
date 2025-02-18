import request from 'supertest';
import createApp from '../../src/index';

describe('Auth Header Validator', () => {
  const app = createApp();

  beforeEach(() => {
    process.env.AUTH_SERVER_SECRET = 'test-secret';
  });

  it('should allow requests with valid auth header', async () => {
    const response = await request(app)
      .get('/worlds')
      .set('Authorization', 'Bearer test-secret');

    expect(response.status).not.toBe(401);
  });

  it('should reject requests with missing auth header', async () => {
    const response = await request(app).get('/worlds');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });

  it('should reject requests with invalid auth header format', async () => {
    const response = await request(app)
      .get('/worlds')
      .set('Authorization', 'InvalidFormat test-secret');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });

  it('should reject requests with wrong secret', async () => {
    const response = await request(app)
      .get('/worlds')
      .set('Authorization', 'Bearer wrong-secret');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Unauthorized'
    });
  });
});
