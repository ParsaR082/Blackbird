# University System Testing Guide

## Overview
This guide provides comprehensive testing instructions for all implemented features of the university administration system.

## Prerequisites
- Node.js and npm installed
- MongoDB running locally or accessible
- Admin user account created
- Development server running (`npm run dev`)

## 1. Authentication & Authorization Testing

### 1.1 Admin Access
```bash
# Test admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### 1.2 Protected Routes
- Navigate to `/admin/university` without login → Should redirect to login
- Login as non-admin user → Should show "Forbidden" error
- Login as admin → Should access all features

## 2. Dashboard & Statistics Testing

### 2.1 Real-time Statistics API
```bash
# Test statistics endpoint
curl -X GET http://localhost:3001/api/admin/university/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalCourses": 15,
    "totalStudents": 1250,
    "totalAssignments": 89,
    "activeSemesters": 2,
    "recentEnrollments": 45,
    "averageGPA": 3.2,
    "completionRate": 0.87
  }
}
```

### 2.2 Dashboard UI Testing
1. **Stats Cards:**
   - Verify all 4 cards display correct numbers
   - Click each card → Should navigate to respective section
   - Check trend indicators (arrows)
   - Test refresh button functionality

2. **Auto-refresh:**
   - Wait 30 seconds → Stats should update automatically
   - Check loading states during refresh

3. **Quick Actions:**
   - Test all 4 quick action buttons
   - Verify navigation to correct pages

## 3. Global Search Testing

### 3.1 Search API Testing
```bash
# Test global search
curl -X GET "http://localhost:3001/api/admin/university/search?q=computer&type=all" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test type-specific search
curl -X GET "http://localhost:3001/api/admin/university/search?q=john&type=students" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "results": [
    {
      "_id": "...",
      "type": "course",
      "displayName": "CS101 - Computer Science",
      "subtitle": "Computer Science • Dr. Smith",
      "status": "Active"
    }
  ],
  "total": 1,
  "query": "computer"
}
```

### 3.2 Search Component Testing
1. **Basic Search:**
   - Type "computer" → Should show relevant results
   - Type "john" → Should show student results
   - Type "assignment" → Should show assignment results

2. **Keyboard Navigation:**
   - Press Arrow Down/Up → Should highlight results
   - Press Enter → Should navigate to selected result
   - Press Escape → Should close dropdown

3. **Click Outside:**
   - Click outside search area → Should close dropdown

4. **Result Types:**
   - Verify correct icons for each type
   - Verify status badges
   - Test navigation to entity pages

## 4. File Management Testing

### 4.1 File Upload API Testing
```bash
# Test file upload
curl -X POST http://localhost:3001/api/admin/university/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "entityType=course" \
  -F "tags=syllabus,required" \
  -F "isPublic=true"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "_id": "...",
    "filename": "1234567890_abc123.pdf",
    "originalName": "test.pdf",
    "size": 1024,
    "entityType": "course",
    "tags": ["syllabus", "required"],
    "isPublic": true
  }
}
```

### 4.2 File Manager Component Testing
1. **File Upload:**
   - Select a PDF file → Should show in input
   - Choose entity type → Should update form
   - Add tags → Should be saved
   - Toggle public/private → Should update
   - Click upload → Should show loading state

2. **File Validation:**
   - Try uploading file > 10MB → Should show error
   - Try uploading unsupported type → Should show error
   - Upload valid file → Should succeed

3. **File List:**
   - Verify file icons based on type
   - Check file size formatting
   - Verify tags display
   - Test download functionality
   - Test delete functionality

4. **Search & Filter:**
   - Search by filename → Should filter results
   - Search by tags → Should filter results

## 5. Course Management Testing

### 5.1 Course API Testing
```bash
# Test course creation
curl -X POST http://localhost:3001/api/admin/university/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CS101",
    "title": "Introduction to Computer Science",
    "description": "Basic programming concepts",
    "department": "Computer Science",
    "credits": 3,
    "semester": "Fall",
    "year": 2024
  }'

# Test course retrieval
curl -X GET "http://localhost:3001/api/admin/university/courses?search=computer" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.2 Course UI Testing
1. **Course List:**
   - Verify all courses display
   - Test search functionality
   - Test department filter
   - Test semester filter

2. **Course Creation:**
   - Fill out course form
   - Submit → Should create course
   - Verify validation errors

3. **Course Editing:**
   - Edit existing course
   - Update fields → Should save changes
   - Test delete functionality

## 6. Assignment Management Testing

### 6.1 Assignment API Testing
```bash
# Test assignment creation
curl -X POST http://localhost:3001/api/admin/university/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID",
    "title": "Programming Assignment 1",
    "description": "Write a simple program",
    "type": "homework",
    "dueDate": "2024-12-15T23:59:59Z",
    "points": 100
  }'
```

### 6.2 Assignment UI Testing
1. **Assignment List:**
   - Verify assignments display
   - Test course filter
   - Test type filter
   - Test due date sorting

2. **Assignment Creation:**
   - Select course
   - Fill assignment details
   - Set due date
   - Submit → Should create assignment

## 7. Student Management Testing

### 7.1 Student API Testing
```bash
# Test student retrieval
curl -X GET "http://localhost:3001/api/admin/university/students?search=john" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7.2 Student UI Testing
1. **Student List:**
   - Verify students display
   - Test search functionality
   - Test active/inactive filter
   - Test semester filter

2. **Student Details:**
   - Click on student → Should show details
   - Verify enrollment information
   - Verify academic records

## 8. Analytics Dashboard Testing

### 8.1 Analytics API Testing
```bash
# Test analytics data
curl -X GET "http://localhost:3001/api/admin/university/analytics?period=month&department=all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8.2 Analytics UI Testing
1. **Charts & Graphs:**
   - Verify all charts render
   - Test time period filters
   - Test department filters
   - Verify data accuracy

2. **Interactive Elements:**
   - Hover over chart elements
   - Click on data points
   - Test filter combinations

## 9. Error Handling Testing

### 9.1 API Error Testing
```bash
# Test unauthorized access
curl -X GET http://localhost:3001/api/admin/university/stats

# Test invalid data
curl -X POST http://localhost:3001/api/admin/university/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

### 9.2 UI Error Testing
1. **Network Errors:**
   - Disconnect internet → Should show error message
   - Reconnect → Should recover

2. **Validation Errors:**
   - Submit empty forms → Should show validation errors
   - Enter invalid data → Should show specific errors

3. **404 Errors:**
   - Navigate to non-existent pages → Should show 404

## 10. Performance Testing

### 10.1 Load Testing
```bash
# Test concurrent requests
for i in {1..10}; do
  curl -X GET http://localhost:3001/api/admin/university/stats &
done
wait
```

### 10.2 UI Performance
1. **Large Data Sets:**
   - Load 1000+ courses → Should handle gracefully
   - Search in large dataset → Should be responsive

2. **Memory Usage:**
   - Monitor memory usage during extended use
   - Check for memory leaks

## 11. Security Testing

### 11.1 Authentication
- Test session timeout
- Test token expiration
- Test logout functionality

### 11.2 Authorization
- Test role-based access control
- Test resource ownership validation

### 11.3 Input Validation
- Test SQL injection attempts
- Test XSS attempts
- Test file upload security

## 12. Browser Compatibility Testing

### 12.1 Desktop Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 12.2 Mobile Browsers
- iOS Safari
- Chrome Mobile
- Samsung Internet

### 12.3 Responsive Design
- Test on various screen sizes
- Test orientation changes
- Test touch interactions

## 13. Accessibility Testing

### 13.1 Keyboard Navigation
- Tab through all interactive elements
- Use arrow keys for navigation
- Test keyboard shortcuts

### 13.2 Screen Reader
- Test with NVDA (Windows)
- Test with VoiceOver (Mac)
- Verify ARIA labels

### 13.3 Color Contrast
- Verify sufficient color contrast
- Test with color blindness simulators

## 14. Integration Testing

### 14.1 Database Integration
- Test MongoDB connections
- Test data persistence
- Test transaction rollbacks

### 14.2 External Services
- Test email service integration
- Test file storage integration
- Test authentication service

## 15. Regression Testing

### 15.1 Automated Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --grep "university"
```

### 15.2 Manual Regression
- Test all previously working features
- Verify no new bugs introduced
- Test edge cases

## 16. Documentation Testing

### 16.1 API Documentation
- Verify all endpoints documented
- Test example requests
- Verify response schemas

### 16.2 User Documentation
- Test user guides
- Verify screenshots are current
- Test troubleshooting guides

## 17. Deployment Testing

### 17.1 Production Build
```bash
# Test production build
npm run build
npm start
```

### 17.2 Environment Variables
- Test all environment variables
- Verify secure defaults
- Test configuration validation

## 18. Monitoring & Logging

### 18.1 Error Logging
- Test error logging functionality
- Verify log levels
- Test log rotation

### 18.2 Performance Monitoring
- Test performance metrics
- Verify monitoring alerts
- Test health checks

## 19. Backup & Recovery

### 19.1 Data Backup
- Test database backup procedures
- Verify backup integrity
- Test restore procedures

### 19.2 Disaster Recovery
- Test system recovery procedures
- Verify data consistency
- Test failover procedures

## 20. User Acceptance Testing

### 20.1 Admin User Testing
- Test all admin workflows
- Verify administrative functions
- Test bulk operations

### 20.2 End-to-End Testing
- Test complete user journeys
- Verify business logic
- Test data integrity

## Conclusion

This testing guide covers all major aspects of the university system. Regular testing should be performed to ensure system reliability and user satisfaction. Update this guide as new features are added or existing features are modified. 