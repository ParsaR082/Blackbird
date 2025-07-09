# Events System Documentation

## Overview

The Blackbird Portal Events System is a comprehensive event management platform that allows administrators to create and manage technology events while enabling users and guests to discover, register, and participate in various learning experiences. The system features a modern interface, robust admin controls, registration tracking, and detailed event management capabilities.

## System Architecture

### Core Components

1. **Event Management**: Admin-only event creation, editing, and management
2. **Event Discovery**: Public event browsing with filtering and search
3. **Registration System**: User and guest event registration with tracking
4. **Admin Dashboard**: Comprehensive event oversight and management
5. **Status Management**: Dynamic event status tracking and updates
6. **Analytics & Stats**: Event performance metrics and attendance tracking

## Database Schema

### Events Collection (`events`)

```javascript
{
  _id: ObjectId,
  title: String,                    // Event title (max 200 chars)
  description: String,              // Short description (max 500 chars)
  detailDescription: String,        // Detailed description (max 2000 chars)
  date: Date,                       // Event date
  time: String,                     // Event time in HH:MM format
  duration: Number,                 // Duration in hours (0.5 - 72)
  location: String,                 // Event location (max 200 chars)
  category: String,                 // Event category (enum)
  maxAttendees: Number,             // Maximum attendee capacity
  currentAttendees: Number,         // Current registered attendees
  status: String,                   // Event status (enum)
  featured: Boolean,                // Featured event flag
  prerequisites: [String],          // Array of prerequisites (max 200 chars each)
  whatYouWillLearn: [String],       // Learning outcomes (max 200 chars each)
  imageUrl: String,                 // Optional event image URL
  createdBy: ObjectId,              // Admin who created the event
  isActive: Boolean,                // Active status (default: true)
  createdAt: Date,
  updatedAt: Date
}
```

### Event Registrations Collection (`eventregistrations`)

```javascript
{
  _id: ObjectId,
  eventId: ObjectId,                // Reference to Event
  userId: ObjectId,                 // Reference to User (for registered users)
  guestInfo: {                      // Required for guest registrations
    fullName: String,               // Guest's full name (max 100 chars)
    email: String,                  // Guest's email (lowercase)
    phoneNumber: String,            // Guest's phone number
    company: String,                // Optional company name (max 100 chars)
    notes: String                   // Optional notes (max 500 chars)
  },
  registrationType: String,         // 'user' or 'guest'
  status: String,                   // Registration status (enum)
  registeredAt: Date,               // Registration timestamp
  cancelledAt: Date,                // Cancellation timestamp (if applicable)
  createdAt: Date,
  updatedAt: Date
}
```

### Event Stats Collection (`eventstats`)

```javascript
{
  _id: ObjectId,
  eventId: ObjectId,                // Reference to Event (unique)
  totalRegistrations: Number,       // Total registration count
  userRegistrations: Number,        // Registered user count
  guestRegistrations: Number,       // Guest registration count
  attendanceRate: Number,           // Attendance percentage (0-100)
  rating: Number,                   // Average event rating (1-5)
  feedback: [{                      // Event feedback array
    userId: ObjectId,               // User who provided feedback
    guestEmail: String,             // Guest email (for guest feedback)
    rating: Number,                 // Individual rating (1-5)
    comment: String,                // Feedback comment (max 1000 chars)
    submittedAt: Date               // Feedback submission time
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Event Categories

The system supports the following event categories:

- **workshops**: Hands-on learning sessions and skill-building workshops
- **hackathons**: Competitive coding events and innovation challenges
- **conferences**: Professional conferences and keynote presentations
- **networking**: Community meetups and professional networking events

## Event Statuses

### Primary Statuses

- **upcoming**: Event is scheduled but registration may not be open
- **registration-open**: Active registration period for the event
- **full**: Maximum capacity reached, no new registrations accepted
- **completed**: Event has finished successfully
- **cancelled**: Event has been cancelled

### Status Transitions

```
upcoming → registration-open → full
upcoming → registration-open → completed
upcoming → cancelled
registration-open → cancelled
full → completed (if cancellations occur)
```

### Automatic Status Management

- **Auto-Full**: Status automatically changes to 'full' when `currentAttendees >= maxAttendees`
- **Auto-Open**: Status reverts to 'registration-open' when attendees drop below capacity
- **Past Event Detection**: Virtual field calculates if event is in the past

## API Endpoints

### Public Endpoints

#### GET `/api/events`

Retrieves active events with filtering and search capabilities.

**Query Parameters:**
- `category` (optional): Filter by category (workshops, hackathons, conferences, networking)
- `limit` (optional): Maximum results (default: 20)
- `search` (optional): Text search in title/description
- `status` (optional): Filter by status (default: 'upcoming,registration-open')

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event_id",
      "title": "Neural Network Workshop",
      "description": "Deep dive into neural network architectures",
      "detailDescription": "Comprehensive workshop covering...",
      "date": "2024-02-15",
      "time": "14:00",
      "duration": "3 hours",
      "location": "Virtual Reality Lab",
      "category": "workshops",
      "attendees": 45,
      "maxAttendees": 50,
      "status": "registration-open",
      "featured": true,
      "prerequisites": ["Basic Python", "Linear Algebra"],
      "whatYouWillLearn": ["Neural network fundamentals", "TensorFlow"],
      "imageUrl": "https://example.com/event.jpg",
      "createdBy": {
        "name": "Dr. Smith",
        "username": "drsmith"
      },
      "timeUntilEvent": "Starts in 5 days, 3 hours",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "categoryCounts": {
    "all": 24,
    "workshops": 8,
    "hackathons": 4,
    "conferences": 6,
    "networking": 6
  },
  "total": 24
}
```

### Admin Endpoints

All admin endpoints require admin authentication and return 403 for non-admin users.

#### POST `/api/admin/events`

Creates a new event (Admin only).

**Request Body:**
```json
{
  "title": "New Workshop",
  "description": "Workshop description",
  "detailDescription": "Detailed workshop information",
  "dateTime": "2024-02-15T14:00:00Z",
  "duration": 3,
  "location": "Innovation Lab",
  "category": "workshops",
  "maxAttendees": 50,
  "featured": false,
  "prerequisites": ["Basic knowledge"],
  "whatYouWillLearn": ["New skills"],
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "new_event_id",
    "title": "New Workshop",
    "status": "upcoming",
    "currentAttendees": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT `/api/admin/events`

Updates an existing event (Admin only).

**Request Body:**
```json
{
  "id": "event_id",
  "title": "Updated Title",
  "status": "registration-open",
  "maxAttendees": 75,
  "featured": true
}
```

#### DELETE `/api/admin/events?id=event_id`

Soft deletes an event by setting `isActive: false` and `status: 'cancelled'`.

#### GET `/api/admin/events`

Retrieves all events for admin management.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `limit` (optional): Maximum results (default: 50)
- `includeInactive` (optional): Include cancelled/inactive events

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event_id",
      "title": "Workshop Title",
      "category": "workshops",
      "status": "upcoming",
      "currentAttendees": 15,
      "maxAttendees": 50,
      "featured": false,
      "isActive": true,
      "createdBy": {
        "id": "admin_id",
        "name": "Admin Name",
        "username": "admin",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T09:15:00Z"
    }
  ],
  "statusCounts": {
    "upcoming": 5,
    "registration-open": 8,
    "full": 2,
    "completed": 15,
    "cancelled": 1
  },
  "total": 31
}
```

## User Interface Features

### Event Discovery Interface

#### Event Grid View
- **Responsive Layout**: Mobile-first design with adaptive grid
- **Category Filtering**: Filter events by category with real-time counts
- **Status Indicators**: Visual status badges with color coding
- **Featured Events**: Prominent display for featured events
- **Time Display**: Dynamic countdown to event start time

#### Event Cards
- **Event Information**: Title, description, date, time, location
- **Capacity Tracking**: Current registrations vs. maximum capacity
- **Quick Actions**: Register button and details modal trigger
- **Creator Attribution**: Display event creator information

### Event Detail Modal

#### Comprehensive Information
- **Full Description**: Detailed event information and context
- **Event Details Grid**: Organized display of key information
- **Prerequisites**: List of required knowledge or skills
- **Learning Outcomes**: What attendees will gain from the event
- **Registration Progress**: Visual capacity indicator

#### Interactive Elements
- **Registration Button**: Direct registration action
- **Calendar Integration**: Add to calendar functionality
- **Social Sharing**: Share event with colleagues (planned)

### Category Navigation

#### Dynamic Categories
- **Real-time Counts**: Live count of events in each category
- **Visual Icons**: Category-specific icons for quick recognition
- **Active State**: Clear indication of selected category
- **Smooth Transitions**: Animated category switching

### Admin Interface Features

#### Create Event Modal
- **Comprehensive Form**: All necessary event details in one interface
- **Date/Time Picker**: Intuitive date and time selection
- **Category Selection**: Dropdown with predefined categories
- **Tag Management**: Featured and status tag configuration
- **Validation**: Real-time form validation and error handling

#### Admin-Only Actions
- **Create Event**: Visible only to admin users
- **Event Management**: Full CRUD operations on events
- **Status Updates**: Quick status changes and management
- **Bulk Operations**: Planned for future releases

## Registration System (Planned)

### User Registration Flow
1. **Event Selection**: User browses and selects an event
2. **Registration Form**: Simple form for registered users
3. **Confirmation**: Immediate registration confirmation
4. **Calendar Integration**: Automatic calendar entry
5. **Reminder System**: Email reminders before event

### Guest Registration Flow
1. **Event Discovery**: Guest browses public events
2. **Detailed Form**: Guest provides contact information
3. **Verification**: Email verification for guest registrations
4. **Confirmation**: Registration confirmation with details
5. **Communication**: Updates via email notifications

### Registration Management
- **Capacity Tracking**: Automatic attendee count management
- **Waitlist System**: Queue management for popular events
- **Cancellation Handling**: Easy cancellation with automatic waitlist promotion
- **Check-in System**: QR code-based event check-in

## Performance Optimizations

### Database Indexing

```javascript
// Event indexes
{ category: 1, status: 1, isActive: 1 }    // Category and status filtering
{ date: 1, status: 1 }                     // Date-based queries
{ featured: 1, status: 1 }                 // Featured event queries
{ createdBy: 1 }                           // Creator-based queries
{ title: 'text', description: 'text' }     // Full-text search

// Registration indexes
{ eventId: 1, status: 1 }                  // Event-specific registrations
{ userId: 1 }                              // User registration history
{ 'guestInfo.email': 1 }                   // Guest email lookups
{ registeredAt: -1 }                       // Registration chronology

// Stats indexes
{ eventId: 1 }                             // Event-specific statistics
```

### Caching Strategy
- **Category Counts**: Cached and updated on event changes
- **Event Listings**: Cached with appropriate TTL
- **User Registrations**: Session-based caching
- **Static Content**: CDN caching for images and assets

### Query Optimization
- **Aggregation Pipelines**: Efficient category counting
- **Selective Population**: Only necessary user fields populated
- **Pagination**: Limit-based pagination for large datasets
- **Index Usage**: Optimized queries using compound indexes

## Security Features

### Authentication & Authorization
- **Admin-Only Operations**: Strict admin verification for management functions
- **User Authentication**: Secure user session management
- **Input Validation**: Comprehensive Zod schema validation
- **CSRF Protection**: Cross-site request forgery protection

### Data Protection
- **Input Sanitization**: All inputs trimmed and validated
- **Email Normalization**: Lowercase email storage
- **Length Limits**: Maximum length validation on all text fields
- **Type Safety**: Full TypeScript implementation

## Error Handling

### Client-Side Error Management
- **Loading States**: Visual feedback during API calls
- **Network Errors**: Graceful handling of connectivity issues
- **Validation Errors**: Real-time form validation feedback
- **Empty States**: Informative displays when no events exist

### Server-Side Error Handling
- **Input Validation**: Comprehensive validation with detailed error messages
- **Database Errors**: Graceful MongoDB error handling
- **Authentication Errors**: Clear unauthorized access messages
- **Logging**: Comprehensive error logging for debugging

## Analytics & Monitoring

### Event Metrics
- **Registration Tracking**: Monitor registration rates and patterns
- **Category Performance**: Track popular event categories
- **Capacity Utilization**: Analyze space usage and demand
- **Creator Performance**: Track admin event creation patterns

### User Engagement
- **Event Discovery**: Track how users find and select events
- **Registration Conversion**: Monitor registration completion rates
- **Repeat Attendance**: Track user engagement over time
- **Feedback Analysis**: Aggregate event feedback and ratings

## Future Enhancements

### Planned Features

#### Registration System
- **Complete Registration Flow**: Full user and guest registration
- **Waitlist Management**: Automatic waitlist with notifications
- **Check-in System**: QR code-based event attendance tracking
- **Certificate Generation**: Automatic completion certificates

#### Advanced Features
- **Calendar Integration**: Sync with Google Calendar, Outlook
- **Payment Processing**: Paid event support with Stripe integration
- **Recurring Events**: Support for series and recurring events
- **Event Templates**: Reusable event templates for admins

#### Communication & Notifications
- **Email System**: Rich HTML email templates
- **SMS Notifications**: Optional SMS reminders and updates
- **In-App Notifications**: Real-time updates within the portal
- **Social Sharing**: Share events on social media platforms

#### Analytics Dashboard
- **Admin Analytics**: Comprehensive event performance dashboard
- **Export Functionality**: PDF/CSV export for event reports
- **Predictive Analytics**: AI-powered attendance predictions
- **Custom Reports**: Flexible reporting system for admins

### Technical Improvements

#### Performance Enhancements
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Search**: Elasticsearch integration for better search
- **Image Management**: CDN integration for event images
- **Microservices**: Split into focused microservices

#### Mobile Experience
- **Native App**: React Native mobile application
- **Offline Support**: Offline event viewing and registration sync
- **Push Notifications**: Mobile push notifications for updates
- **Location Services**: GPS-based event discovery

## Deployment Considerations

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/blackbird
NEXTAUTH_SECRET=your-secret-key
ADMIN_EMAIL=admin@blackbird.com
EVENT_IMAGE_BUCKET=your-s3-bucket
SMTP_HOST=smtp.gmail.com
SMTP_USER=events@blackbird.com
SMTP_PASS=your-smtp-password
```

### Database Setup

1. **Index Creation**: Ensure all performance indexes are created
2. **Validation Rules**: Apply MongoDB schema validation
3. **Backup Strategy**: Regular automated backups
4. **Monitoring**: Database performance monitoring

### Production Checklist

- [ ] Environment variables configured
- [ ] Database indexes created and optimized
- [ ] SMTP configuration tested for notifications
- [ ] Admin user accounts created and verified
- [ ] SSL certificates installed and renewed
- [ ] Error monitoring and alerting configured
- [ ] Performance monitoring dashboard setup
- [ ] Backup and recovery procedures tested
- [ ] CDN configuration for static assets
- [ ] Rate limiting implemented for API endpoints

## Integration Points

### External Services
- **Calendar Providers**: Google Calendar, Outlook, Apple Calendar
- **Email Services**: SendGrid, Mailgun, Amazon SES
- **Image Storage**: AWS S3, Cloudinary, Google Cloud Storage
- **Analytics**: Google Analytics, Mixpanel, custom analytics

### Internal Systems
- **User Management**: Integrated with existing user system
- **Authentication**: Leverages existing auth infrastructure
- **Notifications**: Connects to notification service
- **Audit Logging**: Integrates with system audit logs

This comprehensive Events System provides a robust foundation for managing technology events within the Blackbird Portal, with scalable architecture and plans for extensive future functionality. 