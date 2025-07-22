# Blackbird Assistant Implementation Guide

## Overview

Blackbird Assistant is a comprehensive AI-powered academic companion designed specifically for university students. It provides personalized academic support through four main features: study routine planning, academic insights, feedback analysis, and performance prediction.

## Architecture

The system is built on Next.js with the following key components:

### Backend Components
- **Authentication System**: Role-based access control with admin approval requirement
- **Token Usage Tracking**: Daily limits (20,000 tokens) with 24-hour lockouts
- **Content Filtering**: Proactive filtering for inappropriate content
- **API Integration**: Prepared for AI service integration
- **Database Models**: MongoDB with Mongoose for data persistence

### Frontend Components
- **Assistant Interface**: Modern, responsive chat interface
- **Quick Actions**: University-specific action buttons
- **Admin Dashboard**: Access request management
- **Status Monitoring**: Real-time usage and connection status

## Features Implemented

### 1. Authentication and Access Control ✅
- **Admin Approval Required**: Users must request access before using the assistant
- **Token Usage Tracking**: 20,000 tokens per day limit with automatic lockout
- **Role-Based Access**: Different permissions for users and admins
- **Session Management**: Secure authentication with cookies

**API Endpoints:**
- `GET /api/assistant/access` - Check user access status
- `POST /api/assistant/access` - Request assistant access
- `GET /api/admin/assistant/access` - Admin: View all access requests
- `POST /api/admin/assistant/access` - Admin: Approve/deny requests

### 2. Predefined Action Buttons ✅

#### Daily Study Routine
- **Purpose**: Create personalized study schedules
- **Functionality**: Prompts for courses, study preferences, available time
- **Future Enhancement**: Database integration for automatic course fetching

#### Study Suggestions and Insights
- **Purpose**: Academic planning and course recommendations
- **Functionality**: Provides insights on course selection and academic goals
- **Future Enhancement**: Integration with university course catalog

#### Smart Feedback Analyzer
- **Purpose**: Refine course feedback for professional communication
- **Functionality**: Analyzes and improves feedback tone and structure
- **Future Enhancement**: Direct integration with university feedback systems

#### University Result Predictor
- **Purpose**: Academic performance prediction and improvement suggestions
- **Functionality**: Analyzes study habits, attendance, and performance data
- **Future Enhancement**: Integration with university grading systems

### 3. Content Filtering ✅
- **Proactive Filtering**: Blocks political, explicit, harmful, and inappropriate content
- **Academic Focus**: Ensures conversations remain education-focused
- **Polite Refusal**: Professional responses to filtered requests

### 4. General Chat Mode ✅
- **Academic Support**: Free-form conversations about academic topics
- **Blackbird Assistant Persona**: Maintains consistent, helpful academic tone
- **Token Tracking**: All interactions count toward daily limits

### 5. UI/UX Features ✅
- **Modern Interface**: Clean, responsive design with dark/light themes
- **Real-time Updates**: Live token usage and status indicators
- **Accessibility**: Clear feedback and status messages
- **Mobile Responsive**: Works across all device sizes

## API Endpoints

### Assistant APIs
```
POST /api/assistant/chat
- Main chat interaction endpoint
- Handles content filtering and token tracking
- Supports action types for specialized responses

GET /api/assistant/usage
- Returns current token usage and limits
- Shows lock status and remaining tokens

POST /api/assistant/usage
- Tracks token consumption
- Implements daily limits and lockouts
```

### Admin APIs
```
GET /api/admin/assistant/access
- Lists all access requests with user details
- Provides statistics (total, pending, approved)

POST /api/admin/assistant/access
- Approve or deny access requests
- Requires admin authentication
```

## Database Schema

### AssistantUsage Collection
```javascript
{
  userId: String,           // User ID reference
  date: String,             // Date in YYYY-MM-DD format
  tokensUsed: Number,       // Tokens consumed today
  interactionCount: Number, // Number of interactions
  lastInteraction: Date,    // Last interaction timestamp
  isLocked: Boolean,        // Whether user is locked out
  lockExpiresAt: Date      // When lockout expires
}
```

### AssistantAccess Collection
```javascript
{
  userId: String,      // User ID reference
  isApproved: Boolean, // Approval status
  approvedBy: String,  // Admin who approved
  approvedAt: Date,    // Approval timestamp
  requestedAt: Date,   // Request timestamp
  reason: String       // User's reason for access
}
```

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with:
```env
# Database
DATABASE_URL="your_mongodb_connection_string"

# Authentication
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Service (for future integration)
OPENAI_API_KEY="your_openai_api_key"
# or
ANTHROPIC_API_KEY="your_anthropic_api_key"

# OAuth Providers (optional)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 2. Database Setup
1. Set up MongoDB database
2. Update connection string in environment variables
3. Models will be created automatically on first run

### 3. Admin Account
1. Register a new account through the normal registration flow
2. Update the user's role to 'ADMIN' in the database
3. Set `isVerified: true` for the admin account

### 4. Admin Dashboard Integration
Add the AssistantManager component to your admin dashboard:

```tsx
import { AssistantManager } from '@/app/admin/components/AssistantManager'

// In your admin page
<AssistantManager theme={theme} />
```

## Content Filtering Configuration

The content filtering system uses regex patterns to identify inappropriate content:

```javascript
const inappropriatePatterns = [
  // Political content
  /\b(politics|political|election|vote|democrat|republican)\b/i,
  // Explicit content  
  /\b(sex|sexual|porn|explicit|nude|naked)\b/i,
  // Harmful content
  /\b(suicide|self-harm|violence|weapon|bomb)\b/i,
  // Academic violations
  /\b(hack|illegal|drugs|cheat|plagiarism)\b/i
]
```

You can customize these patterns in `/app/api/assistant/chat/route.ts`.

## Future Enhancements (n8n Integration Ready)

### 1. Telegram Bot Integration
- Prepared API structure for webhook integration
- User identification and session management ready
- Content filtering applies to all channels

### 2. University System Integration
- Database schema ready for course data
- API endpoints prepared for enrollment information
- Calendar integration architecture in place

### 3. Advanced Features
- File upload and analysis
- Study group coordination
- Academic calendar integration
- Performance analytics dashboard

## Token Usage Management

### Daily Limits
- **Default Limit**: 20,000 tokens per day
- **Lockout Duration**: 24 hours from limit reached
- **Reset Time**: Midnight UTC (configurable)

### Usage Tracking
- Tokens counted per interaction
- Real-time usage display
- Admin monitoring capabilities
- Historical usage data

## Security Features

### Access Control
- Admin approval required for new users
- Role-based permissions
- Session-based authentication
- CSRF protection

### Content Security
- Input sanitization
- Content filtering
- Rate limiting
- Secure API endpoints

## Troubleshooting

### Common Issues

1. **Access Denied**: User needs admin approval
2. **Token Limit Reached**: Wait for 24-hour reset
3. **Content Filtered**: Rephrase request to be academic-focused
4. **Authentication Errors**: Check session cookies and login status

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development`.

## Support and Maintenance

### Monitoring
- Token usage trends
- User access patterns
- Content filtering statistics
- Performance metrics

### Regular Maintenance
- Database cleanup of old usage records
- Access request management
- Content filter updates
- Performance optimization

## Conclusion

Blackbird Assistant provides a robust, secure, and scalable academic support system. The implementation follows best practices for authentication, content filtering, and user experience while maintaining flexibility for future enhancements and integrations. 