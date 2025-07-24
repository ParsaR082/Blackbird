/**
 * Manual test script for n8n integration
 * 
 * This script simulates calls to the n8n service and logs the results.
 * It can be used to verify that the integration is working correctly.
 */
require('dotenv').config();
const fetch = require('node-fetch');
const { signPayload } = require('../lib/hmac-signer');

// Set webhook secret
process.env.BUBOT_WEBHOOK_SECRET = process.env.BUBOT_WEBHOOK_SECRET || 'test-webhook-secret';
process.env.N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/bubot-router';

// Test data
const testPayloads = {
  studyPlan: {
    action: 'study_plan_adv',
    userId: '507f1f77bcf86cd799439011',
    payload: {
      freeTime: [
        { day: 'Mon', from: '18:00', to: '21:00' },
        { day: 'Wed', from: '16:00', to: '19:00' }
      ],
      examDates: [
        { courseCode: 'CS101', date: '2025-08-01' }
      ],
      consentDeleteOld: true
    }
  },
  studySuggestions: {
    action: 'study_suggestions_simple',
    userId: '507f1f77bcf86cd799439011',
    payload: {
      courses: ['CS101', 'MATH202'],
      goals: 'become a software engineer'
    }
  },
  feedback: {
    action: 'feedback_send',
    userId: '507f1f77bcf86cd799439011',
    payload: {
      teacherId: '507f1f77bcf86cd799439022',
      courseId: '507f1f77bcf86cd799439033',
      feedback: 'The course was great but the assignments were too difficult. I would appreciate more examples in class.'
    }
  }
};

/**
 * Make a request to the n8n webhook
 * @param {Object} payload - The payload to send
 * @returns {Promise<Object>} - The response from n8n
 */
async function callN8nWebhook(payload) {
  try {
    
    // Get webhook secret and URL
    const secret = process.env.BUBOT_WEBHOOK_SECRET;
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    
    // Sign the payload
    const signature = signPayload(payload, secret);
    
    
    // Call n8n webhook
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bubot-sig': signature
      },
      body: JSON.stringify(payload)
    });
    
    // Check response status
    
    
    // Parse and return the response
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.text();
      return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Run the tests
 */
async function runTests() {
  try {
    
    
    // Test study plan
    await callN8nWebhook(testPayloads.studyPlan);
    
    // Test study suggestions
    await callN8nWebhook(testPayloads.studySuggestions);
    
    // Test feedback
    await callN8nWebhook(testPayloads.feedback);
    
  } catch (error) {
  }
}

// Run the tests
runTests(); 