import { afterEach, expect, jest, test } from '@jest/globals';

const originalFetch = global.fetch;
const originalApiBaseUrl = process.env.REACT_APP_API_BASE_URL;

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiBaseUrl === undefined) {
    delete process.env.REACT_APP_API_BASE_URL;
  } else {
    process.env.REACT_APP_API_BASE_URL = originalApiBaseUrl;
  }
  jest.resetModules();
});

test('uses the configured API base URL', async () => {
  process.env.REACT_APP_API_BASE_URL = 'https://api.example.com';
  const fetchMock = jest.fn().mockResolvedValue('response');
  global.fetch = fetchMock;
  jest.resetModules();
  const { apiFetch } = require('./api');

  await apiFetch('/api/products', { method: 'GET' });

  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.example.com/api/products',
    { method: 'GET' }
  );
});

test('keeps API requests same-origin when no base URL is configured', async () => {
  delete process.env.REACT_APP_API_BASE_URL;
  const fetchMock = jest.fn().mockResolvedValue('response');
  global.fetch = fetchMock;
  jest.resetModules();
  const { apiFetch } = require('./api');

  await apiFetch('/api/products');

  expect(fetchMock).toHaveBeenCalledWith('/api/products', undefined);
});
