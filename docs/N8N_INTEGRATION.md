# n8n Integration with Blackbird Portal

## Overview

This document describes the integration between Blackbird Portal and n8n, a workflow automation platform. The integration enables advanced academic features like study planning, study suggestions, and feedback analysis through n8n workflows.

## Architecture

1. **Blackbird Portal** - The web application that users interact with
2. **n8n** - Workflow automation platform that handles complex processes
3. **DeepSeek R1** - LLM model for generating study plans, suggestions, and feedback

## Features Implemented

### 1. Study Planner (Advanced)
- Creates personalized study plans based on course load and free time
- Deletes old study events to keep the calendar clean
- Adds new events to the calendar

### 2. Study Suggestions (Simple)
- Provides course recommendations based on student goals
- Integrates with DeepSeek R1 for personalized suggestions

### 3. Smart Feedback Analyzer
- Refines student feedback for professionalism and clarity
- Stores feedback in the teacher inbox for review

## Integration Points

### Assistant Chat

The assistant chat has been extended to handle specialized academic actions:

1. When a student interacts with the assistant and requests one of the above features
2. The assistant calls DeepSeek R1 with a specialized system prompt
3. DeepSeek may respond with an action schema like:
   ```json
   {
     "action": "study_plan_adv",
     "payload": {
       "freeTime": [{"day": "Mon", "from": "18:00", "to": "21:00"}],
       "examDates": [{"courseCode": "CS101", "date": "2025-08-01"}],
       "consentDeleteOld": true
     }
   }
   ```
4. The assistant detects this action and forwards it to n8n with proper HMAC signature
5. n8n processes the request and returns a response
6. The assistant formats the response and presents it to the student

## Security

### HMAC Verification

All requests between Blackbird Portal and n8n are signed using HMAC-SHA256:

1. The sender signs the payload using a shared secret
2. The receiver verifies the signature before processing
3. This prevents unauthorized requests and tampering

### Environment Variables

Required environment variables:
- `BUBOT_WEBHOOK_SECRET` - Shared secret for HMAC signing
- `N8N_WEBHOOK_URL` - URL of the n8n webhook
- `DEEPEEK_URL` - URL of the DeepSeek R1 API (configured in n8n)

## Database Changes

The following changes were made to support n8n integration:

1. Added `origin` field to `Event` and `CalendarEvent` models to track automated events
2. Added `study` category to the event categories
3. Created `TeacherInbox` collection for storing analyzed feedback

## n8n Workflows

### BB_ROUTER_SINGLE
- Main workflow that handles all requests from Blackbird Portal
- Routes requests to the appropriate sub-workflow based on action type
- Verifies HMAC signatures for security
- Returns formatted JSON responses

### BB_ERROR_LOGGER
- Logs errors that occur during workflow execution
- Optional for debugging purposes

### BB_TELEGRAM_ROUTER
- Optional integration for Telegram access to the same features
- Uses the same workflows as the web interface

## Implementation Status

All necessary components for the n8n integration have been implemented:

1. **Backend Changes**:
   - HMAC signature verification (`lib/hmac-signer.ts`)
   - n8n service functions (`lib/n8n-service.ts`)
   - TeacherInbox model (`lib/models/teacher-inbox.ts`)
   - Origin field in Event and CalendarEvent schemas
   - Assistant chat route with action parsing and n8n calling
   - Webhook router endpoint for n8n callbacks

2. **n8n Workflows**:
   - BB_ROUTER_SINGLE.json - Main router workflow
   - BB_ERROR_LOGGER.json - Error logging workflow
   - BB_TELEGRAM_ROUTER.json - Telegram integration workflow

3. **Migration Script**:
   - Added script to update existing Event and CalendarEvent documents with the origin field

4. **Documentation**:
   - Full documentation of the integration architecture and setup

## Testing the Integration

### Manual Testing

You can manually test the integration using the provided test script:

```bash
npm run test-n8n
```

This script will:
1. Send test payloads to your configured n8n webhook
2. Sign the payloads with HMAC
3. Log the responses from n8n

### Assistant Testing

To test the integration through the assistant:

1. Navigate to the assistant page in the Blackbird Portal
2. Ask the assistant for one of the following:
   - "Create a study plan for me. I'm free on Monday evenings from 6-9pm and Wednesday afternoons from 3-6pm."
   - "Can you suggest courses for a computer science major interested in AI?"
   - "Help me write feedback for Professor Smith about the difficulty of assignments in CS101."

3. The assistant should detect the need for n8n actions and call the appropriate service

### Troubleshooting

If you're experiencing issues with the integration:

1. Check that n8n is running and accessible
2. Verify that the environment variables are set correctly
3. Look for errors in the n8n execution logs
4. Check the MongoDB database for new entries (events, teacher inbox items)
5. Use the error logger workflow to see if any errors were captured

## Setup Instructions

1. Configure environment variables in Blackbird Portal:
   ```
   BUBOT_WEBHOOK_SECRET=<random_long_string>
   N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/bubot-router-<uuid>
   ```

2. Configure variables in n8n:
   ```
   BUBOT_WEBHOOK_SECRET=<same_as_above>
   DEEPEEK_URL=https://your-llm-endpoint
   ```

3. Import the n8n workflow files:
   - BB_ROUTER_SINGLE.json
   - BB_ERROR_LOGGER.json
   - BB_TELEGRAM_ROUTER.json

4. Set up credentials in n8n:
   - Mongo_Blackbird (MongoDB Atlas URI)
   - DeepSeek_R1 (HTTP Header Auth with Bearer key)
   - Telegram_Blackbird (bot token) if using Telegram integration

## Troubleshooting

Common issues:
- **401 Unauthorized**: Check HMAC secret configuration
- **Connection error**: Ensure n8n is accessible from Blackbird Portal
- **Workflow error**: Check n8n execution logs for details 