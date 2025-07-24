import { NextRequest } from 'next/server';
import { POST as assistantChatPost } from '../../app/api/assistant/chat/route';
import { POST as webhookPost } from '../../app/api/webhook/bubot-router/route';
import { connectToDatabase } from '../../lib/mongodb';
import { signPayload } from '../../lib/hmac-signer';
import mongoose from 'mongoose';

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit): NextRequest => {
  const init = options ? {
    ...options,
    signal: options.signal || undefined
  } : undefined;
  return new NextRequest(new URL(url, 'http://localhost'), init);
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock mongoose
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...originalModule,
    connect: jest.fn().mockResolvedValue({}),
    Schema: jest.fn().mockImplementation(() => ({
      index: jest.fn().mockReturnThis(),
      pre: jest.fn().mockReturnThis(),
      virtual: jest.fn().mockReturnValue({
        get: jest.fn()
      })
    })),
    model: jest.fn().mockImplementation((name) => ({
      findOne: jest.fn().mockImplementation((query) => {
        if (name === 'AssistantAccess') return { isApproved: true };
        if (name === 'AssistantUsage') return { tokensUsed: 100, save: jest.fn() };
        return null;
      }),
      create: jest.fn().mockResolvedValue({ _id: 'new-id', save: jest.fn() }),
      findOneAndUpdate: jest.fn().mockResolvedValue({}),
      findById: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
      insertMany: jest.fn().mockResolvedValue({ insertedCount: 3 })
    })),
    models: {
      AssistantAccess: { findOne: jest.fn().mockResolvedValue({ isApproved: true }) },
      AssistantUsage: { findOne: jest.fn().mockResolvedValue({ tokensUsed: 100, save: jest.fn() }) },
      TeacherInbox: { create: jest.fn() }
    }
  };
});

// Mock server-utils
jest.mock('../../lib/server-utils', () => ({
  getUserFromRequest: jest.fn().mockResolvedValue({
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'USER'
  })
}));

// Mock assistant usage
jest.mock('../../lib/models/assistant-usage', () => ({
  AssistantAccess: {
    findOne: jest.fn().mockResolvedValue({ isApproved: true })
  },
  AssistantUsage: {
    findOne: jest.fn().mockResolvedValue({
      tokensUsed: 100,
      interactionCount: 5,
      save: jest.fn().mockResolvedValue({})
    })
  },
  getTodayString: jest.fn().mockReturnValue('2023-07-30'),
  isUserLocked: jest.fn().mockReturnValue(false)
}));

// Mock n8n-service
jest.mock('../../lib/n8n-service', () => ({
  callStudyPlanAdvanced: jest.fn().mockResolvedValue({
    status: 'ok',
    inserted: 3,
    summary: 'Created 3 study sessions for your courses'
  }),
  callStudySuggestions: jest.fn().mockResolvedValue({
    suggestions: [
      { course: 'CS101', reason: 'Foundational programming course' },
      { course: 'MATH202', reason: 'Important for algorithm analysis' }
    ],
    note: 'These courses align with your career goals'
  }),
  callFeedbackSend: jest.fn().mockResolvedValue({
    status: 'ok',
    sent: true
  })
}));

describe('n8n Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Assistant Chat Route', () => {
    it('should process a regular assistant message without n8n action', async () => {
      // Mock a successful response from the LLM
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Hello, I am Blackbird Assistant. How can I help you?'
              }
            }
          ],
          usage: {
            total_tokens: 100
          }
        })
      });

      // Create mock request with a regular message
      const req = createMockRequest('http://localhost/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello, how are you?',
          actionType: 'general'
        })
      });

      // Call the route handler
      const res = await assistantChatPost(req);
      const data = await res.json();

      // Verify response
      expect(res.status).toBe(200);
      expect(data.response).toContain('Hello, I am Blackbird Assistant');
      expect(data.tokensUsed).toBe(100);
    });

    it('should process a study plan action message and call n8n', async () => {
      // Mock a successful response from the LLM with action
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: `{ "action": "study_plan_adv", "payload": { "freeTime": [{"day": "Mon", "from": "18:00", "to": "21:00"}], "examDates": [{"courseCode": "CS101", "date": "2023-08-01"}], "consentDeleteOld": true } }`
              }
            }
          ],
          usage: {
            total_tokens: 150
          }
        })
      });

      // Create mock request for study plan
      const req = createMockRequest('http://localhost/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Create a study plan for me. I am free on Monday from 6-9pm and have a CS101 exam on August 1st.',
          actionType: 'study-schedule-planning'
        })
      });

      // Call the route handler
      const res = await assistantChatPost(req);
      const data = await res.json();

      // Verify response
      expect(res.status).toBe(200);
      expect(data.response).toContain('I\'ve created your study plan');
      expect(data.tokensUsed).toBe(150 + 50); // Original tokens + n8n call tokens
      expect(data.n8nResult).toEqual({
        status: 'ok',
        inserted: 3,
        summary: 'Created 3 study sessions for your courses'
      });
    });

    it('should process a study suggestions action message and call n8n', async () => {
      // Mock a successful response from the LLM with action
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: `{ "action": "study_suggestions_simple", "payload": { "courses": ["CS101", "MATH202"], "goals": "become a software engineer" } }`
              }
            }
          ],
          usage: {
            total_tokens: 120
          }
        })
      });

      // Create mock request for study suggestions
      const req = createMockRequest('http://localhost/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'I need suggestions for CS and Math courses. My goal is to become a software engineer.',
          actionType: 'study-suggestions'
        })
      });

      // Call the route handler
      const res = await assistantChatPost(req);
      const data = await res.json();

      // Verify response
      expect(res.status).toBe(200);
      expect(data.response).toContain('Here are my course suggestions');
      expect(data.response).toContain('CS101');
      expect(data.response).toContain('MATH202');
      expect(data.tokensUsed).toBe(120 + 50); // Original tokens + n8n call tokens
    });

    it('should process a feedback action message and call n8n', async () => {
      // Mock a successful response from the LLM with action
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: `{ "action": "feedback_send", "payload": { "teacherId": "teacher123", "courseId": "course456", "feedback": "The course was great but could use more examples." } }`
              }
            }
          ],
          usage: {
            total_tokens: 130
          }
        })
      });

      // Create mock request for feedback
      const req = createMockRequest('http://localhost/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'I want to send feedback about my programming course to Professor Smith.',
          actionType: 'feedback-analyzer'
        })
      });

      // Call the route handler
      const res = await assistantChatPost(req);
      const data = await res.json();

      // Verify response
      expect(res.status).toBe(200);
      expect(data.response).toContain('processed and delivered your feedback');
      expect(data.tokensUsed).toBe(130 + 50); // Original tokens + n8n call tokens
    });

    it('should handle n8n error gracefully', async () => {
      // Mock a successful response from the LLM with action
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: `{ "action": "study_plan_adv", "payload": { "freeTime": [{"day": "Mon", "from": "18:00", "to": "21:00"}], "examDates": [], "consentDeleteOld": true } }`
              }
            }
          ],
          usage: {
            total_tokens: 140
          }
        })
      });

      // Mock n8n service to throw an error
      jest.mock('../../lib/n8n-service', () => ({
        callStudyPlanAdvanced: jest.fn().mockRejectedValue(new Error('n8n connection error')),
        callStudySuggestions: jest.fn(),
        callFeedbackSend: jest.fn()
      }));

      // Mock error logging API
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logged: true })
      });

      // Create mock request
      const req = createMockRequest('http://localhost/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Create a study plan for Monday evening.',
          actionType: 'study-schedule-planning'
        })
      });

      // Call the route handler (expect it not to throw)
      const res = await assistantChatPost(req);
      const data = await res.json();

      // Verify appropriate fallback response
      expect(res.status).toBe(200);
      expect(data.response).toContain('I apologize, but I couldn\'t create your study plan');
    });
  });

  describe('Webhook Router', () => {
    it('should reject requests with invalid signatures', async () => {
      // Create mock request with invalid signature
      const req = createMockRequest('http://localhost/api/webhook/bubot-router', {
        method: 'POST',
        body: JSON.stringify({
          action: 'callback_study_plan',
          data: { summary: 'Test plan' }
        }),
        headers: {
          'x-bubot-sig': 'invalid-signature'
        }
      });

      // Call the route handler
      const res = await webhookPost(req);
      const data = await res.json();

      // Verify response
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should accept requests with valid signatures', async () => {
      process.env.BUBOT_WEBHOOK_SECRET = 'test-secret';
      
      // Create payload and valid signature
      const payload = {
        action: 'callback_study_plan',
        data: { summary: 'Test plan' }
      };
      const payloadText = JSON.stringify(payload);
      const validSignature = signPayload(payloadText, process.env.BUBOT_WEBHOOK_SECRET);

      // Create mock request with valid signature
      const req = createMockRequest('http://localhost/api/webhook/bubot-router', {
        method: 'POST',
        body: payloadText,
        headers: {
          'x-bubot-sig': validSignature
        }
      });

      // Call the route handler
      const res = await webhookPost(req);
      const data = await res.json();

      // Verify response
      expect(res.status).toBe(200);
      expect(data.status).toBe('ok');
    });
  });
}); 