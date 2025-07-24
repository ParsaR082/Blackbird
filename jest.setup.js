// Mock environment variables
process.env.BUBOT_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/bubot-router';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.GEMINI_API_KEY = 'test-gemini-api-key';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock Next.js components
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: 'test-cookie-value' }),
    set: jest.fn(),
  }),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn((data, options = {}) => ({
        status: options?.status || 200,
        headers: new Map(),
        json: async () => data,
      })),
      next: jest.fn(() => ({
        headers: new Map(),
      })),
    },
  };
}); 