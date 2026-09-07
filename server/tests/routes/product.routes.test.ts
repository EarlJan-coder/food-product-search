import request from 'supertest';
import express from 'express';
import productRoutes from '../../src/routes/product.routes';
import { searchProducts, getProductByBarcode } from '../../src/services/openFoodFacts.service';
import prisma from '../../src/lib/prisma';

jest.mock('../../src/services/openFoodFacts.service');
jest.mock('../../src/lib/prisma');

const mockSearchProducts = searchProducts as jest.MockedFunction<typeof searchProducts>;
const mockGetProductByBarcode = getProductByBarcode as jest.MockedFunction<typeof getProductByBarcode>;
const mockPrisma = prisma as jest.MockedObject<typeof prisma>;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);
  return app;
}

describe('Product Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('GET /api/products/search', () => {
    it('returns products for valid search query', async () => {
      const mockProducts = [
        {
          barcode: '123456789',
          name: 'Test Product',
          brand: 'Test Brand',
          imageUrl: 'https://example.com/image.jpg',
        },
      ];

      mockSearchProducts.mockResolvedValue(mockProducts);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });
      (mockPrisma.search.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .get('/api/products/search')
        .query({ q: 'chocolate', lang: 'en' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        query: 'chocolate',
        language: 'en',
        count: 1,
        products: mockProducts,
      });
      expect(mockSearchProducts).toHaveBeenCalledWith('chocolate', 'en');
    });

    it('returns 400 when query is missing', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({ lang: 'en' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Search query is required',
      });
    });

    it('returns 400 for unsupported language', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({ q: 'chocolate', lang: 'es' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Unsupported Language',
      });
    });

    it('returns 502 when OpenFoodFacts API fails', async () => {
      mockSearchProducts.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/products/search')
        .query({ q: 'chocolate', lang: 'en' });

      expect(response.status).toBe(502);
      expect(response.body).toEqual({
        error: 'Unable to retrieve products',
      });
    });
  });

  describe('GET /api/products/:barcode', () => {
    it('returns product without nutrition when user is not subscribed', async () => {
      const mockProduct = {
        barcode: '123456789',
        name: 'Test Product',
        brand: 'Test Brand',
        imageUrl: 'https://example.com/image.jpg',
        nutrition: { energyKcal: 100, fat: 5, carbohydrates: 10, sugars: 5, protein: 2, salt: 0.5 },
      };

      mockGetProductByBarcode.mockResolvedValue(mockProduct);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ subscriptionStatus: 'inactive' });

      const response = await request(app)
        .get('/api/products/123456789')
        .query({ lang: 'en' });

      expect(response.status).toBe(200);
      expect(response.body.product.nutrition).toBeNull();
    });

    it('returns product with nutrition when user has active subscription', async () => {
      const mockProduct = {
        barcode: '123456789',
        name: 'Test Product',
        brand: 'Test Brand',
        imageUrl: 'https://example.com/image.jpg',
        nutrition: { energyKcal: 100, fat: 5, carbohydrates: 10, sugars: 5, protein: 2, salt: 0.5 },
      };

      mockGetProductByBarcode.mockResolvedValue(mockProduct);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ subscriptionStatus: 'active' });

      const response = await request(app)
        .get('/api/products/123456789')
        .query({ lang: 'en' });

      expect(response.status).toBe(200);
      expect(response.body.product.nutrition).toEqual(mockProduct.nutrition);
    });
  });

  describe('GET /api/products/:barcode/nutrition', () => {
    it('returns 403 when user does not have active subscription', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ subscriptionStatus: 'inactive' });

      const response = await request(app)
        .get('/api/products/123456789/nutrition')
        .query({ lang: 'en' });

      expect(response.status).toBe(403);
    });
  });
});
