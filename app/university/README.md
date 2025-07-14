# University System Module

This directory contains the University System module for the Blackbird Portal. The system provides students with tools to manage their academic journey, including course enrollment, assignment tracking, study planning, and academic progress monitoring.

## Directory Structure

```
/university/
├── components/           # Shared UI components specific to university module
│   ├── ErrorMessage.tsx  # Inline error message component
│   ├── ErrorState.tsx    # Full page error state component
│   └── LoadingState.tsx  # Loading state component
├── courses/              # Course management pages
│   ├── components/       # Course-specific components
│   └── page.tsx          # Main courses page
├── study-plans/          # Study plan management pages
│   ├── components/       # Study plan-specific components
│   └── page.tsx          # Main study plans page
├── assignments/          # Assignment management pages
│   └── page.tsx          # Main assignments page
├── progress/             # Academic progress tracking pages
│   └── page.tsx          # Main progress page
└── page.tsx              # University dashboard main page
```

## Getting Started

The University System integrates with the Blackbird Portal authentication and theming system. All pages require the user to be authenticated, and proper error handling and loading states are implemented throughout.

### Prerequisites

- User authentication must be set up
- Theme context must be available
- MongoDB connection must be configured

### Key Features

1. **Dashboard**
   - Overview of academic status
   - Quick access links to courses, study plans, etc.
   - Academic statistics and recent activity

2. **Courses**
   - Browse available courses
   - Enroll in courses for specific semesters
   - View enrolled courses grouped by semester
   - Filter courses by department, level, etc.

3. **Study Plans**
   - Create personalized study plans
   - Track study plan progress
   - Manage study tasks and deadlines

4. **Assignments**
   - View upcoming assignments
   - Submit assignment responses
   - Track grades and feedback

5. **Progress**
   - View academic record
   - Track GPA and credits
   - Monitor graduation requirements progress

## Development Guide

### Adding a New Page

1. Create a new directory for your feature
2. Create a page.tsx file with client-side rendering
3. Implement authentication check
4. Add loading and error handling
5. Use the shared components for consistency

Example:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'

export default function NewFeaturePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university/new-feature')
      return
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchData = async () => {
    try {
      // Fetch data...
    } catch (err) {
      setError('Error message')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return <LoadingState message="Loading..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  return (
    // Your page content...
  )
}
```

### Creating API Routes

When adding new API routes for the university system:

1. Place them in `/api/university/[feature]`
2. Ensure proper authentication checks
3. Follow the error handling pattern:

```ts
try {
  // Your logic here
} catch (err) {
  console.error('Error in API route:', err)
  return NextResponse.json(
    { error: 'User-friendly error message' },
    { status: appropriate_status_code }
  )
}
```

### UI Components

The system provides several shared components:

1. **LoadingState**: For full-page loading
2. **ErrorState**: For full-page errors
3. **ErrorMessage**: For inline error messages

When creating new UI components:

- Support both light and dark themes
- Ensure responsive behavior
- Follow the design patterns used in existing components

## Testing

When writing tests for the university system:

1. Mock authentication and theme contexts
2. Mock API responses for data fetching
3. Test loading and error states
4. Test user interactions and state changes

## Additional Resources

For complete documentation about the University System, please refer to:

- [Database Schema](/docs/university-system.md#database-schema)
- [API Endpoints](/docs/university-system.md#api-endpoints)
- [UI Components](/docs/university-system.md#ui-components) 