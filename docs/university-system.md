# University System Documentation

## Overview

The University System is a comprehensive educational management platform within the Blackbird Portal application. It provides functionality for students to enroll in courses, create study plans, track assignments and academic progress.

## System Architecture

### Core Components

1. **Course Management**
   - Browse available courses
   - View course details and prerequisites
   - Semester-based course offerings

2. **Enrollment System**
   - Semester-based enrollment
   - Course selection and registration
   - Credit tracking and limits

3. **Assignment Management**
   - View and submit assignments
   - Track due dates and completion status
   - File uploads and submissions

4. **Study Plans**
   - Create personalized study plans
   - Set academic goals
   - Track progress towards completion

5. **Academic Record**
   - View grades and GPA
   - Track completed courses
   - Monitor academic standing

6. **Admin Interface**
   - Course creation and management
   - Assignment creation and grading
   - Semester scheduling and management

## Data Models

### Course

```typescript
interface Course {
  _id: string
  courseCode: string
  title: string
  description: string
  credits: number
  professor: {
    name: string
    email: string
    department: string
  }
  department: string
  level: 'undergraduate' | 'graduate'
  prerequisites: string[]
  semester: 'Fall' | 'Spring' | 'Summer'
  year: number
  maxStudents: number
  currentEnrollments: number
  syllabus?: string
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

### Assignment

```typescript
interface Assignment {
  _id: string
  courseId: string
  title: string
  description: string
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'reading'
  dueDate: Date
  points: number
  isRequired: boolean
  attachments: {
    name: string
    url: string
    type: string
  }[]
  createdAt: Date
  updatedAt: Date
}
```

### User Assignment

```typescript
interface UserAssignment {
  _id: string
  userId: string
  assignmentId: string
  courseId: string
  status: 'pending' | 'in-progress' | 'submitted' | 'graded' | 'overdue'
  submissionDate?: Date
  grade?: number
  feedback?: string
  attachments: {
    name: string
    url: string
    type: string
  }[]
  timeSpent: number // in minutes
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Study Plan

```typescript
interface StudyPlan {
  _id: string
  userId: string
  title: string
  description: string
  academicYear: number
  semester: 'Fall' | 'Spring' | 'Summer'
  courses: string[] // Course IDs
  goals: string[]
  targetGPA: number
  progress: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Academic Record

```typescript
interface AcademicRecord {
  _id: string
  userId: string
  academicYear: number
  semester: 'Fall' | 'Spring' | 'Summer'
  courses: {
    courseId: string
    grade: string
    gpa: number
    credits: number
  }[]
  semesterGPA: number
  cumulativeGPA: number
  totalCredits: number
  completedCredits: number
  status: 'active' | 'completed' | 'on-hold'
  createdAt: Date
  updatedAt: Date
}
```

### Semester

```typescript
interface Semester {
  _id: string
  year: number
  term: 'Fall' | 'Spring' | 'Summer'
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Semester Enrollment

```typescript
interface SemesterEnrollment {
  _id: string
  userId: string
  semesterId: string
  year: number
  term: 'Fall' | 'Spring' | 'Summer'
  courses: string[] // Array of course IDs
  totalCredits: number
  status: 'registered' | 'in-progress' | 'completed'
  gpa: number
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Courses

- `GET /api/university/courses`: Get all available courses with optional filtering
- `GET /api/university/courses/:id`: Get details for a specific course
- `POST /api/admin/university/courses`: Create a new course (admin only)
- `PUT /api/admin/university/courses?courseId=[id]`: Update a course (admin only)
- `DELETE /api/admin/university/courses?courseId=[id]`: Delete or deactivate a course (admin only)

### Enrollments

- `GET /api/university/enrollments`: Get all enrollments for the authenticated user
- `POST /api/university/enrollments`: Create a new enrollment for a course
- `DELETE /api/university/enrollments?id=[id]`: Drop a course enrollment

### Semesters

- `GET /api/university/semesters`: Get all available semesters or active semesters
- `GET /api/university/semesters?id=[id]`: Get details for a specific semester
- `POST /api/admin/university/semesters`: Create a new semester (admin only)
- `PUT /api/admin/university/semesters?id=[id]`: Update a semester (admin only)
- `DELETE /api/admin/university/semesters?id=[id]`: Delete or deactivate a semester (admin only)

### Semester Enrollments

- `GET /api/university/semester-enrollments`: Get all semester enrollments for the authenticated user
- `GET /api/university/semester-enrollments?id=[id]`: Get details for a specific semester enrollment
- `POST /api/university/semester-enrollments`: Create a new semester enrollment with selected courses
- `PUT /api/university/semester-enrollments?id=[id]`: Update courses for an existing semester enrollment
- `DELETE /api/university/semester-enrollments?id=[id]`: Drop a semester enrollment

### Assignments

- `GET /api/university/assignments`: Get assignments for the authenticated user
- `GET /api/university/assignments/:id`: Get details for a specific assignment
- `GET /api/university/assignments?courseId=[id]`: Get assignments for a specific course
- `POST /api/admin/university/assignments`: Create a new assignment (admin only)
- `PUT /api/admin/university/assignments?assignmentId=[id]`: Update an assignment (admin only)
- `DELETE /api/admin/university/assignments?assignmentId=[id]`: Delete an assignment (admin only)

### User Assignments (Submissions)

- `GET /api/university/submissions`: Get user assignment submissions
- `GET /api/university/submissions/:id`: Get a specific submission
- `POST /api/university/submissions`: Create a new submission for an assignment
- `PUT /api/university/submissions/:id`: Update a submission
- `DELETE /api/university/submissions/:id`: Delete a submission

### Study Plans

- `GET /api/university/study-plans`: Get study plans for the authenticated user
- `GET /api/university/study-plans/:id`: Get details for a specific study plan
- `POST /api/university/study-plans`: Create a new study plan
- `PUT /api/university/study-plans/:id`: Update a study plan
- `DELETE /api/university/study-plans/:id`: Delete a study plan

### Academic Records

- `GET /api/university/academic-record`: Get academic record for the authenticated user
- `GET /api/university/academic-record/semester/:year/:term`: Get academic record for a specific semester
- `POST /api/admin/university/academic-record`: Create or update academic record (admin only)

## Frontend Pages

### Student Interface

- `/university`: University dashboard with semester overview and academic stats
- `/university/courses`: Browse available courses
- `/university/semester-enrollment`: Manage semester enrollment and course selection
- `/university/study-plans`: Create and manage study plans
- `/university/assignments`: View and submit assignments
- `/university/academic-record`: View academic record, grades, and progress

### Admin Interface

- `/admin/university/courses`: Manage university courses
- `/admin/university/assignments`: Manage course assignments
- `/admin/university/semesters`: Manage academic semesters
- `/admin/university/students`: View and manage student enrollments
- `/admin/university/academic-records`: Manage student academic records

## Workflow

### Student Course Enrollment

1. Student navigates to University Dashboard
2. Views available semesters with registration status
3. Selects a semester with open registration
4. Browses available courses for that semester
5. Selects desired courses
6. Confirms enrollment in selected courses
7. Receives confirmation of successful enrollment
8. Can modify course selection before registration deadline
9. Can view enrolled courses on dashboard

### Course Assignment Flow

1. Admin creates assignments for courses
2. Students view assignments for enrolled courses
3. Students complete and submit assignments
4. Admin reviews and grades submissions
5. Students receive grades and feedback
6. Academic record is updated

## System Integration

The University System integrates with the following components:

- Authentication System: For user authentication and authorization
- User Management: For student and faculty information
- File Storage: For assignment submissions and course materials
- Notification System: For alerts about deadlines, grade postings, etc.

## Security Considerations

- Course enrollment is limited to authenticated users
- Assignment submissions are secured and private
- Admin functions require special permissions
- Data is properly validated and sanitized
- Appropriate CSRF protection is implemented

## Future Enhancements

- Real-time notifications for assignment deadlines
- Integration with calendar systems
- Peer review functionality for assignments
- Advanced analytics for academic performance
- Mobile app support for on-the-go access 