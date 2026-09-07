import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/user.route';
import prisma from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma');

const mockPrisma = prisma as jest.MockedObject<typeof prisma>;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/user', userRoutes);
  return app;
}

describe('User Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('GET /api/user/me', () => {
    it('returns demo user information', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'demo@example.com',
        name: 'Demo User',
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_123',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/user/me');

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: 'user-123',
        email: 'demo@example.com',
        name: 'Demo User',
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_123',
      });
    });

    it('returns 404 when demo user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/user/me');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found',
      });
    });
  });
});
