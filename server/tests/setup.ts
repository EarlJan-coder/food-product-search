process.env.DATABASE_URL = process.env.DATABASE_URL || '******localhost:3306/food_search';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
process.env.STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_placeholder';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

afterAll(() => {
  jest.clearAllMocks();
});
