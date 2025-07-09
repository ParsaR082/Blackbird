# Blackbird Portal University System

This documentation provides an overview of the University System implementation within the Blackbird Portal. The system is designed to help students manage their academic journey including courses, enrollments, study plans, assignments, and tracking academic progress.

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Pages](#frontend-pages)
5. [UI Components](#ui-components)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling & Loading States](#error-handling--loading-states)
8. [Responsive Design](#responsive-design)
9. [Future Enhancements](#future-enhancements)

## System Overview

The University System is built as a module within the Blackbird Portal to provide students with a comprehensive academic management platform. Key features include:

- Course browsing and enrollment
- Study plan creation and tracking
- Assignment submission and management
- Academic record and progress tracking
- Semester and credit management
- GPA calculation and academic standing

The system follows a client-server architecture with a React-based frontend and Node.js/MongoDB backend.

## Database Schema

### Models

All database models are defined in `lib/models/university.ts` and include:

#### Course
```typescript
{
  courseCode: string           // Unique identifier for the course (e.g., CS101)
  title: string                // Course title
  description: string          // Course description
  credits: number              // Number of credits for the course
  professor: {                 // Professor information
    name: string
    email: string
    office: string
  }
  department: string           // Department offering the course
  level: string                // Course level (Beginner, Intermediate, Advanced)
  prerequisites: string[]      // Array of courseCode prerequisites
  semester: string             // Semester offered (Fall, Spring, Summer)
  year: number                 // Academic year
  maxEnrollment: number        // Maximum number of students
  currentEnrollment: number    // Current number of enrolled students
}
```

#### Enrollment
```typescript
{
  userId: ObjectId             // Reference to User model
  courseId: ObjectId           // Reference to Course model
  semester: string             // Semester of enrollment
  year: number                 // Year of enrollment
  status: string               // Status: 'enrolled', 'completed', 'dropped'
  grade: string                // Final grade (if completed)
  enrollmentDate: Date         // Date of enrollment
}
```

#### Assignment
```typescript
{
  courseId: ObjectId           // Reference to Course model
  title: string                // Assignment title
  description: string          // Assignment description
  dueDate: Date                // Due date
  totalPoints: number          // Maximum points possible
  weight: number               // Weight in final grade calculation (percentage)
}
```

#### AssignmentSubmission
```typescript
{
  userId: ObjectId             // Reference to User model
  assignmentId: ObjectId       // Reference to Assignment model
  submissionDate: Date         // Date of submission
  status: string               // Status: 'draft', 'submitted', 'graded', 'late'
  content: string              // Submission content/answer
  attachments: string[]        // Attachment URLs
  score: number                // Points awarded
  feedback: string             // Feedback from professor
  lastModified: Date           // Last modified date
}
```

#### StudyPlan
```typescript
{
  userId: ObjectId             // Reference to User model
  title: string                // Plan title
  description: string          // Plan description
  type: string                 // Type: 'personal', 'semester', 'yearly'
  status: string               // Status: 'active', 'paused', 'completed'
  startDate: Date              // Start date
  endDate: Date                // End date
  tasks: [{                    // Study tasks
    title: string
    description: string
    completed: boolean
    dueDate: Date
    priority: string           // Priority: 'low', 'medium', 'high'
  }]
  createdAt: Date              // Creation date
  lastModified: Date           // Last modified date
}
```

#### AcademicRecord
```typescript
{
  userId: ObjectId             // Reference to User model
  cumulativeGPA: number        // Overall GPA
  totalCreditsEarned: number   // Total credits earned
  totalCreditsAttempted: number // Total credits attempted
  academicStanding: string     // Standing: 'Good Standing', 'Probation', etc.
  semesters: [{                // Semester records
    year: number
    semester: string
    gpa: number
    creditsEarned: number
    creditsAttempted: number
    courses: [{                // Courses in this semester
      courseId: ObjectId
      grade: string
      status: string
      credits: number
    }]
  }]
  progressTowardsGraduation: {  // Graduation progress
    percentage: number
    requiredCredits: number
    completedCredits: number
  }
  lastUpdated: Date            // Last update date
}
```

## API Endpoints

### Courses API

#### Public Endpoints

`GET /api/university/courses`
- **Description**: Retrieves a list of available courses
- **Auth**: Required
- **Returns**: `{ courses: Course[] }`

`GET /api/university/courses/:id`
- **Description**: Retrieves details for a specific course
- **Auth**: Required
- **Returns**: `{ course: Course }`

#### Admin Endpoints

`POST /api/university/admin/courses`
- **Description**: Creates a new course
- **Auth**: Admin only
- **Body**: Course object
- **Returns**: `{ course: Course }`

`PUT /api/university/admin/courses/:id`
- **Description**: Updates a course
- **Auth**: Admin only
- **Body**: Course object
- **Returns**: `{ course: Course }`

`DELETE /api/university/admin/courses/:id`
- **Description**: Deletes a course
- **Auth**: Admin only
- **Returns**: `{ success: true }`

### Enrollments API

`GET /api/university/enrollments`
- **Description**: Retrieves user's course enrollments
- **Auth**: Required
- **Returns**: `{ enrollments: [...] }`

`POST /api/university/enrollments`
- **Description**: Enrolls user in a course
- **Auth**: Required
- **Body**: `{ courseId, year, semester }`
- **Returns**: `{ enrollment: Enrollment }`

`DELETE /api/university/enrollments`
- **Description**: Unenrolls user from a course
- **Auth**: Required
- **Query**: `?enrollmentId=123`
- **Returns**: `{ success: true }`

### Assignments API

`GET /api/university/assignments`
- **Description**: Retrieves assignments for user's enrolled courses
- **Auth**: Required
- **Query**: Optional `?courseId=123&upcoming=true`
- **Returns**: `{ assignments: [...] }`

`GET /api/university/assignments/:id`
- **Description**: Retrieves a specific assignment details
- **Auth**: Required
- **Returns**: `{ assignment: Assignment, submission?: AssignmentSubmission }`

`POST /api/university/assignments/:id/submit`
- **Description**: Submits an assignment
- **Auth**: Required
- **Body**: `{ content, attachments }`
- **Returns**: `{ submission: AssignmentSubmission }`

### Study Plans API

`GET /api/university/study-plans`
- **Description**: Retrieves user's study plans
- **Auth**: Required
- **Query**: Optional `?active=true`
- **Returns**: `{ studyPlans: [...] }`

`POST /api/university/study-plans`
- **Description**: Creates a study plan
- **Auth**: Required
- **Body**: Study plan object
- **Returns**: `{ studyPlan: StudyPlan }`

`PUT /api/university/study-plans/:id`
- **Description**: Updates a study plan
- **Auth**: Required
- **Body**: Study plan updates
- **Returns**: `{ studyPlan: StudyPlan }`

`DELETE /api/university/study-plans/:id`
- **Description**: Deletes a study plan
- **Auth**: Required
- **Returns**: `{ success: true }`

### Academic Record API

`GET /api/university/academic-record`
- **Description**: Retrieves user's academic record
- **Auth**: Required
- **Returns**: `{ record: AcademicRecord, currentStatus: {...} }`

## Frontend Pages

### University Portal Dashboard (`app/university/page.tsx`)
- Overview of academic status
- Quick access to courses, study plans, and progress
- Recent activity feed
- Academic statistics (GPA, credits, etc.)

### Courses Page (`app/university/courses/page.tsx`)
- Browse available courses
- View enrolled courses by semester
- Course enrollment and unenrollment
- Course filtering and search
- Responsive course cards with detailed information

### Study Plans Page (`app/university/study-plans/page.tsx`)
- Create and manage study plans
- Track progress on study tasks
- Filter plans by type and status
- Add/edit study tasks

### Progress Page (`app/university/progress/page.tsx`)
- View academic record and progress
- Semester-by-semester breakdown
- Graduation requirements tracking
- GPA calculator

### Assignments Page (`app/university/assignments/page.tsx`)
- View upcoming and past assignments
- Submit assignment responses
- Track assignment grades and feedback
- Filter assignments by course and status

## UI Components

### Reusable Components

- `LoadingState` (`app/university/components/LoadingState.tsx`): Consistent loading UI
- `ErrorState` (`app/university/components/ErrorState.tsx`): Full-page error display
- `ErrorMessage` (`app/university/components/ErrorMessage.tsx`): Inline error message

### Course Components
- `CourseCard`: Display course information in a compact card
- `EnrollmentModal`: Dialog for course enrollment
- `CourseFilters`: Search and filter controls for courses

### Study Plan Components
- `StudyPlanCard`: Display study plan with progress
- `StudyPlanFilters`: Filter controls for study plans
- `TaskList`: List of tasks in a study plan

## Authentication & Authorization

The university system leverages the portal's existing authentication system. Key points:

- All university pages require authentication
- Course enrollment and academic data are user-specific
- Admin-only routes for course management, grade updates, etc.
- Session validation on both client and server

## Error Handling & Loading States

The system implements comprehensive error handling:

1. **API Error Handling**
   - Structured error responses with appropriate HTTP status codes
   - Detailed error messages for debugging
   - Validation errors with field-specific messages

2. **Frontend Error States**
   - Full-page error displays for critical failures
   - Inline error messages for form validations and operations
   - Retry mechanisms for transient failures

3. **Loading States**
   - Consistent loading indicators throughout the application
   - Skeleton loaders for content-heavy pages
   - Disabled UI elements during async operations

## Responsive Design

The university system is fully responsive:

- Mobile-first approach with adaptive layouts
- Flexible grids that adjust to different screen sizes
- Touch-friendly UI elements
- Optimized typography and spacing for readability
- Theme support (light/dark mode)

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Features**
   - Calendar integration for assignments and deadlines
   - Real-time notifications for grades and course updates
   - Peer collaboration tools for group assignments
   - Academic advisor communication channel

2. **Technical Improvements**
   - Implement data caching for performance optimization
   - Add offline support for basic functionality
   - Improve data visualization for academic progress
   - Integration with external learning management systems 