import request from 'supertest';
import * as express from 'express';
import subscriptionRoutes from '../../src/routes/subscription.route';
import prisma from '../../src/lib/prisma';
import { createCheckoutSession, createPortalSession } from '../../src/services/stripe.service';

jest.mock('../../src/lib/prisma');
jest.mock('../../src/services/stripe.service');

const mockPrisma = prisma as jest.MockedObject<typeof prisma>;
const mockCreateCheckoutSession = createCheckoutSession as jest.MockedFunction<typeof createCheckoutSession>;
const mockCreatePortalSession = createPortalSession as jest.MockedFunction<typeof createPortalSession>;

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
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
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
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        subscriptionStatus: 'active',
      });

      const response = await request(app)
        .post('/api/subscriptions/checkout');

      expect(response.status).toBe(400);
    });

    it('returns 404 when demo user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/subscriptions/checkout');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/subscriptions/portal', () => {
    it('creates portal session for subscribed user', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
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
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
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
