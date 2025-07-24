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
    console.log(`\nTesting ${payload.action}...`);
    
    // Get webhook secret and URL
    const secret = process.env.BUBOT_WEBHOOK_SECRET;
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    console.log(`Using webhook URL: ${webhookUrl}`);
    
    // Sign the payload
    const signature = signPayload(payload, secret);
    console.log(`Generated signature: ${signature.substring(0, 10)}...`);
    
    // Call n8n webhook
    console.log('Sending request to n8n...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bubot-sig': signature
      },
      body: JSON.stringify(payload)
    });
    
    // Check response status
    console.log(`Response status: ${response.status}`);
    
    // Parse and return the response
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      return data;
    } else {
      const error = await response.text();
      console.error(`Error response: ${error}`);
      return null;
    }
  } catch (error) {
    console.error('Error calling n8n webhook:', error.message);
    return null;
  }
}

/**
 * Run the tests
 */
async function runTests() {
  try {
    console.log('=== n8n Integration Test ===');
    console.log('Testing connection to n8n...');
    
    // Test study plan
    await callN8nWebhook(testPayloads.studyPlan);
    
    // Test study suggestions
    await callN8nWebhook(testPayloads.studySuggestions);
    
    // Test feedback
    await callN8nWebhook(testPayloads.feedback);
    
    console.log('\nTests completed!');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the tests
runTests(); 