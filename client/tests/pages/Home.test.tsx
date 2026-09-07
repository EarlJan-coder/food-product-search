import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../../app/page';
import * as api from '@/lib/api';

vi.mock('@/lib/api');

const mockSearchProducts = api.searchProducts as ReturnType<typeof vi.fn>;
const mockGetProductNutrition = api.getProductNutrition as ReturnType<typeof vi.fn>;
const mockCreateCheckoutSession = api.createCheckoutSession as ReturnType<typeof vi.fn>;

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Search Form', () => {
    it('displays search form with input and language selector', () => {
      render(<Home />);

      expect(screen.getByPlaceholderText('Search for a product...')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    it('updates query state when typing', async () => {
      render(<Home />);

      const input = screen.getByPlaceholderText('Search for a product...');
      fireEvent.change(input, { target: { value: 'chocolate' } });

      expect((input as HTMLInputElement).value).toBe('chocolate');
    });

    it('updates language when selection changes', async () => {
      render(<Home />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'fr' } });

      expect((select as HTMLSelectElement).value).toBe('fr');
    });
  });

  describe('Search Results', () => {
    it('displays products after successful search', async () => {
      const mockProducts = [
        {
          barcode: '123456789',
          name: 'Dark Chocolate',
          brand: 'Nestle',
          imageUrl: 'https://example.com/chocolate.jpg',
        },
      ];

      mockSearchProducts.mockResolvedValue({
        query: 'chocolate',
        language: 'en',
        count: 1,
        products: mockProducts,
      });

      render(<Home />);

      const input = screen.getByPlaceholderText('Search for a product...');
      fireEvent.change(input, { target: { value: 'chocolate' } });

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Dark Chocolate')).toBeInTheDocument();
      });
    });

    it('displays error message when search fails', async () => {
      mockSearchProducts.mockRejectedValue(new Error('API Error'));

      render(<Home />);

      const input = screen.getByPlaceholderText('Search for a product...');
      fireEvent.change(input, { target: { value: 'chocolate' } });

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Unable to search for products.')).toBeInTheDocument();
      });
    });

    it('displays no results message when search returns empty', async () => {
      mockSearchProducts.mockResolvedValue({
        query: 'nonexistent',
        language: 'en',
        count: 0,
        products: [],
      });

      render(<Home />);

      const input = screen.getByPlaceholderText('Search for a product...');
      fireEvent.change(input, { target: { value: 'nonexistent' } });

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('No products found.')).toBeInTheDocument();
      });
    });
  });

  describe('Product Modal', () => {
    it('shows subscription required message when clicking product without subscription', async () => {
      const mockProducts = [
        {
          barcode: '123456789',
          name: 'Dark Chocolate',
          brand: 'Nestle',
          imageUrl: null,
        },
      ];

      mockSearchProducts.mockResolvedValue({
        query: 'chocolate',
        language: 'en',
        count: 1,
        products: mockProducts,
      });
      mockGetProductNutrition.mockRejectedValue(new Error('SUBSCRIPTION_REQUIRED'));

      render(<Home />);

      const input = screen.getByPlaceholderText('Search for a product...');
      fireEvent.change(input, { target: { value: 'chocolate' } });

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      await waitFor(() => {
        const card = screen.getByText('Dark Chocolate');
        fireEvent.click(card);
      });

      await waitFor(() => {
        expect(screen.getByText(/Nutritional information is available to active subscribers only/i)).toBeInTheDocument();
      });
    });

    it('displays nutrition data when user has subscription', async () => {
      const mockProducts = [
        {
          barcode: '123456789',
          name: 'Dark Chocolate',
          brand: 'Nestle',
          imageUrl: null,
        },
      ];

      const mockNutrition = {
        energyKcal: 500,
        fat: 30,
        carbohydrates: 50,
        sugars: 40,
        protein: 5,
        salt: 0.1,
      };

      mockSearchProducts.mockResolvedValue({
        query: 'chocolate',
        language: 'en',
        count: 1,
        products: mockProducts,
      });
      mockGetProductNutrition.mockResolvedValue({
        barcode: '123456789',
        nutrition: mockNutrition,
      });

      render(<Home />);

      const input = screen.getByPlaceholderText('Search for a product...');
      fireEvent.change(input, { target: { value: 'chocolate' } });

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      await waitFor(() => {
        const card = screen.getByText('Dark Chocolate');
        fireEvent.click(card);
      });

      await waitFor(() => {
        expect(screen.getByText('500 kcal')).toBeInTheDocument();
      });
    });
  });
});
