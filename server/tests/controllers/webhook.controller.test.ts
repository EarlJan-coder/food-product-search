import { stripeWebhookController } from '../../src/controllers/stripe-webhook.controller';
import type { Request, Response } from 'express';

jest.mock('../../src/lib/prisma', () => {
  const mockUserUpdate = jest.fn();
  const mockUserUpdateMany = jest.fn();
  return {
    __esModule: true,
    default: {
      user: {
        update: mockUserUpdate,
        updateMany: mockUserUpdateMany,
      },
    },
    mockUserUpdate,
    mockUserUpdateMany,
  };
});

jest.mock('stripe', () => {
  const mockConstructEvent = jest.fn();
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    mockConstructEvent,
  }));
});

jest.mock('../../src/lib/stripe', () => {
  const mockConstructEvent = jest.fn();
  return {
    __esModule: true,
    default: {
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    },
    mockConstructEvent,
  };
});

const prismaModule = require('../../src/lib/prisma');
const stripeModule = require('../../src/lib/stripe');
const Stripe = require('stripe');

const mockUserUpdate = prismaModule.mockUserUpdate;
const mockUserUpdateMany = prismaModule.mockUserUpdateMany;
const mockConstructEvent = stripeModule.mockConstructEvent;

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
    mockConstructEvent.mockImplementation((payload, _signature) => payload);
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

      mockUserUpdate.mockResolvedValue({
        id: 'user-123',
        email: 'demo@example.com',
        subscriptionStatus: 'active',
      });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockUserUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ received: true });
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

      mockUserUpdateMany.mockResolvedValue({ count: 1 });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockUserUpdateMany).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_123' },
        data: { subscriptionStatus: 'active', stripeSubscriptionId: 'sub_123' },
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

      mockUserUpdateMany.mockResolvedValue({ count: 1 });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockUserUpdateMany).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_123' },
        data: { subscriptionStatus: 'inactive', stripeSubscriptionId: 'sub_123' },
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

      mockUserUpdateMany.mockResolvedValue({ count: 1 });

      const req = createMockRequest(event);
      const res = createMockResponse();

      await stripeWebhookController(req as Request, res as Response);

      expect(mockUserUpdateMany).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_123' },
        data: {
          subscriptionStatus: 'inactive',
          stripeSubscriptionId: null,
        },
      });
    });
  });
});
