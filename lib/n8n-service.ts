import { signPayload, getWebhookSecret } from './hmac-signer';

/**
 * The base URL of the n8n webhook
 * This should be configured in the environment variables
 */
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/bubot-router';

/**
 * Allowed action types for n8n router
 */
export type N8nAction = 'study_plan_adv' | 'study_suggestions_simple' | 'feedback_send';

/**
 * Base payload structure for n8n router
 */
export interface N8nBasePayload {
  action: N8nAction;
  userId: string;
  payload: any;
}

/**
 * Study plan advanced payload
 */
export interface StudyPlanAdvPayload {
  freeTime: Array<{ day: string; from: string; to: string }>;
  examDates: Array<{ courseCode: string; date: string }>;
  consentDeleteOld: boolean;
}

/**
 * Study suggestions simple payload
 */
export interface StudySuggestionsPayload {
  courses: string[];
  goals: string;
}

/**
 * Feedback send payload
 */
export interface FeedbackSendPayload {
  teacherId: string;
  courseId: string;
  feedback: string;
}

/**
 * Call the n8n webhook with a payload and get the response
 * 
 * @param payload The payload to send to n8n
 * @returns The response from n8n
 */
export async function callN8nWebhook<T>(payload: N8nBasePayload): Promise<T> {
  try {
    // Get webhook secret
    const secret = getWebhookSecret();
    
    // Sign the payload
    const signature = signPayload(payload, secret);
    
    // Call n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bubot-sig': signature
      },
      body: JSON.stringify(payload)
    });
    
    // Check if response is OK
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`N8n webhook error (${response.status}): ${error}`);
    }
    
    // Parse and return the response
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    throw error;
  }
}

/**
 * Call the study plan advanced workflow
 * 
 * @param userId The user ID
 * @param payload The study plan payload
 * @returns The response from n8n
 */
export function callStudyPlanAdvanced(userId: string, payload: StudyPlanAdvPayload) {
  return callN8nWebhook<{
    status: string;
    inserted: number;
    summary: string;
    calendarUrl?: string;
  }>({
    action: 'study_plan_adv',
    userId,
    payload
  });
}

/**
 * Call the study suggestions simple workflow
 * 
 * @param userId The user ID
 * @param payload The study suggestions payload
 * @returns The response from n8n
 */
export function callStudySuggestions(userId: string, payload: StudySuggestionsPayload) {
  return callN8nWebhook<{
    suggestions: Array<{ course: string; reason: string }>;
    note?: string;
  }>({
    action: 'study_suggestions_simple',
    userId,
    payload
  });
}

/**
 * Call the feedback send workflow
 * 
 * @param userId The user ID
 * @param payload The feedback payload
 * @returns The response from n8n
 */
export function callFeedbackSend(userId: string, payload: FeedbackSendPayload) {
  return callN8nWebhook<{
    status: string;
    sent: boolean;
  }>({
    action: 'feedback_send',
    userId,
    payload
  });
} 