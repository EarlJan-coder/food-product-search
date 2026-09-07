import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/user.route';

jest.mock('../../src/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  const mockFindFirst = jest.fn();
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: mockFindUnique,
        findFirst: mockFindFirst,
      },
    },
    mockFindUnique,
    mockFindFirst,
  };
});

const prismaModule = require('../../src/lib/prisma');
const mockUserFindUnique = prismaModule.mockFindUnique;

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

      mockUserFindUnique.mockResolvedValue(mockUser);

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
      mockUserFindUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/user/me');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found',
      });
    });
  });
});
