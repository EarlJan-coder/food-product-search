import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'location', {
  value: {
    href: '',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

global.fetch = vi.fn();
