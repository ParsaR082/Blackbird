# Product Playground System Documentation

## Overview

The Blackbird Portal Product Playground is a comprehensive e-commerce system that allows administrators to create and manage products while enabling guests, users, and admins to make purchases. The system features a complete purchase workflow with admin approval, guest contact management, and real-time status tracking.

## System Architecture

### Core Components

1. **Product Management**: Admin-only product creation and management
2. **Purchase System**: Universal purchase flow for guests, users, and admins
3. **Admin Approval Workflow**: All purchases require admin confirmation
4. **Guest Contact System**: Comprehensive contact information collection
5. **Notification System**: Automated guest notifications for purchase updates
6. **Status Tracking**: Real-time purchase status with visual indicators

## Database Schema

### Products Collection (`products`)

```javascript
{
  _id: ObjectId,
  name: String,                     // Product name (max 200 chars)
  description: String,              // Product description (max 2000 chars)
  price: Number,                    // Product price (min 0)
  currency: String,                 // Currency code (USD, EUR, GBP, CAD, AUD)
  category: String,                 // Product category (enum)
  imageUrl: String,                 // Optional product image URL
  features: [String],               // Array of product features (max 200 chars each)
  specifications: Object,           // Free-form specifications object
  isActive: Boolean,                // Product availability (default: true)
  stock: Number,                    // Stock count (null = unlimited)
  createdBy: ObjectId,              // Admin who created the product
  createdAt: Date,
  updatedAt: Date
}
```

### Purchases Collection (`purchases`)

```javascript
{
  _id: ObjectId,
  productId: ObjectId,              // Reference to Product
  quantity: Number,                 // Purchase quantity (min 1)
  totalAmount: Number,              // Calculated total price
  currency: String,                 // Purchase currency
  
  // Buyer Information
  buyerType: String,                // 'guest', 'user', or 'admin'
  userId: ObjectId,                 // Reference to User (for registered buyers)
  guestInfo: {                      // Required for guest purchases
    fullName: String,               // Guest's full name (max 100 chars)
    email: String,                  // Guest's email (lowercase)
    phoneNumber: String,            // Guest's phone number
    company: String,                // Optional company name (max 100 chars)
    address: String,                // Guest's address (max 200 chars)
    city: String,                   // Guest's city (max 50 chars)
    country: String,                // Guest's country (max 50 chars)
    notes: String                   // Optional notes (max 500 chars)
  },
  
  // Purchase Status
  status: String,                   // 'pending', 'approved', 'rejected', 'completed', 'cancelled'
  adminNotes: String,               // Admin notes (max 1000 chars)
  approvedBy: ObjectId,             // Admin who processed the purchase
  approvedAt: Date,                 // When the purchase was processed
  
  createdAt: Date,
  updatedAt: Date
}
```

### Guest Notifications Collection (`guestnotifications`)

```javascript
{
  _id: ObjectId,
  purchaseId: ObjectId,             // Reference to Purchase
  email: String,                    // Guest's email
  type: String,                     // 'purchase_received' or 'status_update'
  message: String,                  // Notification message (max 1000 chars)
  sentAt: Date,                     // When notification was created
  isRead: Boolean,                  // Read status (default: false)
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints

#### GET `/api/products`

Retrieves active products with filtering and search capabilities.

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Maximum results (default: 20)
- `search` (optional): Text search in name/description

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "currency": "USD",
      "category": "Software",
      "imageUrl": "https://example.com/image.jpg",
      "features": ["Feature 1", "Feature 2"],
      "specifications": {"spec1": "value1"},
      "stock": 10,
      "createdBy": {
        "name": "Admin Name",
        "username": "admin"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "categoryCounts": {
    "Software": 5,
    "Hardware": 3,
    "Service": 2,
    "Consultation": 1,
    "Training": 4,
    "License": 2,
    "Other": 1
  },
  "total": 18
}
```

#### POST `/api/purchases`

Creates a new purchase (supports guests, users, and admins).

**Request Body (Guest):**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "guestInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "company": "Acme Corp",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "notes": "Urgent delivery needed"
  }
}
```

**Request Body (User/Admin):**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase request submitted successfully. We will contact you shortly.",
  "purchase": {
    "id": "purchase_id",
    "productName": "Product Name",
    "quantity": 2,
    "totalAmount": 199.98,
    "currency": "USD",
    "status": "pending",
    "redirectToAdmin": false
  }
}
```

#### GET `/api/purchases`

Retrieves purchase history for authenticated users.

**Authentication:** Required (User/Admin)

**Response:**
```json
{
  "success": true,
  "purchases": [
    {
      "id": "purchase_id",
      "product": {
        "id": "product_id",
        "name": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "currency": "USD",
        "category": "Software",
        "imageUrl": "https://example.com/image.jpg"
      },
      "quantity": 1,
      "totalAmount": 99.99,
      "currency": "USD",
      "status": "approved",
      "adminNotes": "Approved for immediate processing",
      "approvedBy": {
        "name": "Admin Name",
        "username": "admin"
      },
      "approvedAt": "2024-01-15T11:00:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Admin Endpoints

#### POST `/api/admin/products`

Creates a new product (Admin only).

**Authentication:** Admin required

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "currency": "USD",
  "category": "Software",
  "imageUrl": "https://example.com/image.jpg",
  "features": ["Feature 1", "Feature 2"],
  "specifications": {"spec1": "value1"},
  "stock": 50
}
```

#### PUT `/api/admin/products`

Updates an existing product (Admin only).

**Request Body:**
```json
{
  "id": "product_id",
  "name": "Updated Product Name",
  "price": 149.99,
  "isActive": true,
  "stock": 25
}
```

#### DELETE `/api/admin/products?id=product_id`

Soft deletes a product by setting `isActive` to false (Admin only).

#### GET `/api/admin/purchases`

Retrieves all purchases for admin review.

**Query Parameters:**
- `status` (optional): Filter by status
- `buyerType` (optional): Filter by buyer type
- `limit` (optional): Maximum results (default: 50)

**Response:**
```json
{
  "success": true,
  "purchases": [
    {
      "id": "purchase_id",
      "product": {...},
      "quantity": 1,
      "totalAmount": 99.99,
      "currency": "USD",
      "buyerType": "guest",
      "buyer": {
        "type": "guest",
        "info": {
          "fullName": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "+1234567890",
          "company": "Acme Corp",
          "address": "123 Main St",
          "city": "New York",
          "country": "USA",
          "notes": "Urgent delivery needed"
        }
      },
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "statusCounts": {
    "pending": 5,
    "approved": 10,
    "rejected": 2,
    "completed": 15,
    "cancelled": 1
  },
  "total": 33
}
```

#### PUT `/api/admin/purchases`

Updates purchase status (Admin only).

**Request Body:**
```json
{
  "id": "purchase_id",
  "status": "approved",
  "adminNotes": "Approved for immediate processing"
}
```

## Product Categories

The system supports the following product categories:

- **Software**: Applications, tools, and digital products
- **Hardware**: Physical devices and equipment
- **Service**: Consulting and professional services
- **Consultation**: Expert advice and guidance
- **Training**: Educational courses and workshops
- **License**: Software licenses and subscriptions
- **Other**: Miscellaneous products

## Purchase Workflow

### 1. Guest Purchase Flow

1. **Product Selection**: Guest browses products and clicks "Purchase"
2. **Contact Information**: Guest fills out comprehensive contact form
3. **Purchase Creation**: System creates purchase with `status: 'pending'`
4. **Stock Update**: Stock is decremented (if applicable)
5. **Guest Notification**: Automatic notification sent confirming receipt
6. **Admin Review**: Purchase appears in admin panel for approval
7. **Status Updates**: Admin approves/rejects with optional notes
8. **Guest Communication**: System sends status update notifications

### 2. User/Admin Purchase Flow

1. **Product Selection**: Authenticated user clicks "Purchase"
2. **Simple Form**: Only quantity selection required
3. **Purchase Creation**: System creates purchase with user information
4. **Admin Approval**: Purchase requires admin confirmation
5. **Status Tracking**: User can view purchase status in their account
6. **Completion**: Admin processes the purchase to completion

### 3. Admin Approval Workflow

1. **Review Dashboard**: Admin sees all pending purchases
2. **Buyer Information**: Complete buyer details and purchase information
3. **Action Selection**: Approve, reject, complete, or cancel
4. **Notes Addition**: Optional admin notes for the decision
5. **Stock Management**: Automatic stock restoration on rejection/cancellation
6. **Notification**: Guest receives automatic email notification

## User Interface Features

### Product Grid

- **Responsive Layout**: Mobile-friendly grid with hover effects
- **Category Filtering**: Filter products by category with counts
- **Search Functionality**: Text search across names and descriptions
- **Stock Display**: Visual indication of stock levels
- **Feature Preview**: Show top 3 features with "more" indicator
- **Creator Attribution**: Display product creator information

### Purchase Modal

- **Adaptive Form**: Different forms for guests vs. authenticated users
- **Real-time Validation**: Client-side form validation
- **Total Calculation**: Dynamic price calculation based on quantity
- **Stock Checking**: Prevent over-purchasing available stock
- **Responsive Design**: Mobile-optimized modal interface

### Purchase Tracking

- **Status Icons**: Visual indicators for each purchase status
- **Status Colors**: Color-coded status badges
- **Timeline View**: Chronological purchase history
- **Admin Notes**: Display admin feedback to users
- **Action Buttons**: Quick access to product details

### Admin Dashboard

- **Purchase Management**: Comprehensive purchase review interface
- **Filtering Options**: Filter by status, buyer type, date range
- **Bulk Actions**: Process multiple purchases efficiently
- **Buyer Details**: Complete guest contact information
- **Status Updates**: Quick approval/rejection workflow

## Status Management

### Purchase Statuses

- **Pending**: Initial status for all new purchases
- **Approved**: Admin has approved the purchase
- **Rejected**: Admin has rejected the purchase
- **Completed**: Purchase has been fulfilled
- **Cancelled**: Purchase has been cancelled

### Status Transitions

```
Pending → Approved → Completed
Pending → Rejected
Pending → Cancelled
Approved → Cancelled
Approved → Completed
```

### Automatic Actions

- **Stock Restoration**: Stock is restored when purchases are rejected or cancelled
- **Guest Notifications**: Automatic emails sent on status changes
- **Timestamp Tracking**: All status changes are timestamped
- **Admin Attribution**: Track which admin processed each purchase

## Security Features

### Authentication & Authorization

- **Admin-Only Product Management**: Only admins can create/edit products
- **Purchase Authentication**: Users must be authenticated to view purchase history
- **CSRF Protection**: All state-changing operations protected
- **Input Validation**: Comprehensive validation using Zod schemas

### Data Protection

- **Email Normalization**: Guest emails stored in lowercase
- **Input Sanitization**: All text inputs trimmed and length-limited
- **Type Safety**: Full TypeScript implementation
- **Database Validation**: Schema-level validation in MongoDB

## Performance Optimizations

### Database Indexing

```javascript
// Product indexes
{ category: 1, isActive: 1 }        // Category filtering
{ createdBy: 1 }                    // Creator lookup
{ name: 'text', description: 'text' } // Text search

// Purchase indexes
{ buyerType: 1, userId: 1 }         // User purchase lookup
{ status: 1, createdAt: -1 }        // Status filtering
{ productId: 1 }                    // Product reference
{ 'guestInfo.email': 1 }            // Guest email lookup

// Guest notification indexes
{ email: 1, isRead: 1 }             // Notification queries
{ purchaseId: 1 }                   // Purchase relationship
```

### Caching Strategy

- **Product Counts**: Category counts cached and updated on product changes
- **User Purchases**: Purchase history cached per user session
- **Image Loading**: Lazy loading for product images
- **API Responses**: Optimized response sizes with selective field inclusion

## Error Handling

### Client-Side

- **Form Validation**: Real-time validation with user-friendly messages
- **Network Errors**: Graceful handling of API failures
- **Loading States**: Visual feedback during API calls
- **Empty States**: Informative empty state displays

### Server-Side

- **Input Validation**: Comprehensive Zod schema validation
- **Database Errors**: Graceful MongoDB error handling
- **Authentication Errors**: Clear unauthorized access messages
- **Stock Validation**: Prevent overselling with atomic operations

## Monitoring & Analytics

### Key Metrics

- **Product Performance**: Track views, purchases, and conversion rates
- **Purchase Flow**: Monitor completion rates and abandonment points
- **Admin Efficiency**: Track approval times and rejection rates
- **Guest Engagement**: Monitor guest purchase conversion

### Logging

- **Purchase Events**: Log all purchase creation and status changes
- **Admin Actions**: Track all admin operations with timestamps
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Monitoring**: API response time tracking

## Future Enhancements

### Planned Features

- **Payment Integration**: Stripe/PayPal integration for online payments
- **Inventory Tracking**: Advanced inventory management with low-stock alerts
- **Product Reviews**: Customer review and rating system
- **Bulk Ordering**: Support for bulk purchase discounts
- **Email Templates**: Rich HTML email templates for notifications

### Technical Improvements

- **Real-time Updates**: WebSocket integration for live status updates
- **Advanced Search**: Elasticsearch integration for better search
- **Image Management**: CDN integration for product image hosting
- **Export Functionality**: PDF/CSV export for purchase reports
- **API Rate Limiting**: Implement rate limiting for public endpoints

## Deployment Considerations

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/blackbird
NEXTAUTH_SECRET=your-secret-key
ADMIN_EMAIL=admin@blackbird.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=notifications@blackbird.com
SMTP_PASS=your-smtp-password
```

### Database Setup

1. **Indexes**: Ensure all indexes are created for optimal performance
2. **Validation**: MongoDB schema validation rules applied
3. **Backup**: Regular database backups configured
4. **Monitoring**: Database performance monitoring enabled

### Production Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SMTP configuration tested
- [ ] Admin user accounts created
- [ ] SSL certificates installed
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Backup procedures tested

This comprehensive Product Playground system provides a robust foundation for e-commerce operations within the Blackbird Portal, with full admin control, guest support, and scalable architecture for future growth. 