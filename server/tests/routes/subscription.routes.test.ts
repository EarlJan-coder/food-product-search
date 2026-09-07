import request from 'supertest';
import express from 'express';
import subscriptionRoutes from '../../src/routes/subscription.route';

jest.mock('../../src/lib/prisma', () => {
  const mockUserFindUnique = jest.fn();
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: mockUserFindUnique,
      },
    },
    mockUserFindUnique,
  };
});

jest.mock('../../src/services/stripe.service', () => {
  const mockCreateCheckoutSession = jest.fn();
  const mockCreatePortalSession = jest.fn();
  return {
    __esModule: true,
    createCheckoutSession: mockCreateCheckoutSession,
    createPortalSession: mockCreatePortalSession,
    mockCreateCheckoutSession,
    mockCreatePortalSession,
  };
});

const prismaModule = require('../../src/lib/prisma');
const stripeModule = require('../../src/services/stripe.service');
const mockUserFindUnique = prismaModule.mockUserFindUnique;
const mockCreateCheckoutSession = stripeModule.mockCreateCheckoutSession;
const mockCreatePortalSession = stripeModule.mockCreatePortalSession;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/subscriptions', subscriptionRoutes);
  return app;
}

describe('Subscription Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('POST /api/subscriptions/checkout', () => {
    it('creates checkout session for inactive user', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        subscriptionStatus: 'inactive',
      });
      mockCreateCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      } as any);

      const response = await request(app)
        .post('/api/subscriptions/checkout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        url: 'https://checkout.stripe.com/test',
      });
    });

    it('returns 400 when user already has active subscription', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        subscriptionStatus: 'active',
      });

      const response = await request(app)
        .post('/api/subscriptions/checkout');

      expect(response.status).toBe(400);
    });

    it('returns 404 when demo user not found', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/subscriptions/checkout');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/subscriptions/portal', () => {
    it('creates portal session for subscribed user', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        stripeCustomerId: 'cus_123',
      });
      mockCreatePortalSession.mockResolvedValue({
        id: 'bps_123',
        url: 'https://billing.stripe.com/test',
      } as any);

      const response = await request(app)
        .post('/api/subscriptions/portal');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        url: 'https://billing.stripe.com/test',
      });
    });

    it('returns 400 when user has no stripe customer id', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        stripeCustomerId: null,
      });

      const response = await request(app)
        .post('/api/subscriptions/portal');

      expect(response.status).toBe(400);
    });
  });
});
