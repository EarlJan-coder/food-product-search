import { stripeWebhookController } from '../../src/controllers/stripe-webhook.controller';
import prisma from '../../src/lib/prisma';
import type { Request, Response } from 'express';

jest.mock('../../src/lib/prisma');

const mockPrisma = prisma as jest.MockedObject<typeof prisma>;

function createMockRequest(body: any, signature?: string): Partial<Request> {
  return {
    body,
    headers: {
      'stripe-signature': signature || 'test-signature',
    },
  } as Partial<Request>;
}

function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('Stripe Webhook Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkout.session.completed', () => {
    it('activates subscription for user', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer_email: 'demo@example.com',
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: {
              userEmail: 'demo@example.com',
            },
          },
        },
      };

      (mockPrisma.user.upsert as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        subscriptionStatus: 'active',
      });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockPrisma.user.upsert).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('customer.subscription.updated', () => {
    it('activates subscription when status is active', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
          },
        },
      };

      (mockPrisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_123' },
        data: { subscriptionStatus: 'active' },
      });
    });

    it('deactivates subscription when status is past_due', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'past_due',
          },
        },
      };

      (mockPrisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_123' },
        data: { subscriptionStatus: 'inactive' },
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('deactivates subscription when deleted', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
          },
        },
      };

      (mockPrisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_123' },
        data: {
          subscriptionStatus: 'inactive',
          stripeSubscriptionId: null,
        },
      });
    });
  });
});
