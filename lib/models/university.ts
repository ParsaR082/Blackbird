import mongoose from 'mongoose'

export interface ICourse {
  _id?: string
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
  createdBy: string // Admin who created it
  createdAt: Date
  updatedAt: Date
}

export interface IAssignment {
  _id?: string
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

export interface IUserCourse {
  _id?: string
  userId: string
  courseId: string
  academicYear: number
  semester: 'Fall' | 'Spring' | 'Summer'
  enrollmentDate: Date
  status: 'enrolled' | 'completed' | 'dropped' | 'failed'
  grade?: string
  gpa?: number
  attendance: number // percentage
  progress: number // percentage
  createdAt: Date
  updatedAt: Date
}

export interface IUserAssignment {
  _id?: string
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

export interface IStudyPlan {
  _id?: string
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

export interface IAcademicRecord {
  _id?: string
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

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  professor: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    }
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  level: {
    type: String,
    required: true,
    enum: ['undergraduate', 'graduate']
  },
  prerequisites: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  maxStudents: {
    type: Number,
    required: true,
    min: 1,
    max: 500
  },
  currentEnrollments: {
    type: Number,
    default: 0,
    min: 0
  },
  syllabus: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

const AssignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['homework', 'quiz', 'exam', 'project', 'reading']
  },
  dueDate: {
    type: Date,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    max: 1000
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'link']
    }
  }]
}, {
  timestamps: true
})

const UserCourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  academicYear: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['enrolled', 'completed', 'dropped', 'failed'],
    default: 'enrolled'
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4
  },
  attendance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
})

const UserAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'submitted', 'graded', 'overdue'],
    default: 'pending'
  },
  submissionDate: {
    type: Date
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'link']
    }
  }],
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const StudyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  academicYear: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  goals: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  targetGPA: {
    type: Number,
    min: 0,
    max: 4
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const AcademicRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  courses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    grade: {
      type: String,
      required: true,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    }
  }],
  semesterGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  cumulativeGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  totalCredits: {
    type: Number,
    required: true,
    min: 0
  },
  completedCredits: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active'
  }
}, {
  timestamps: true
})

// Indexes for better performance
CourseSchema.index({ courseCode: 1 })
CourseSchema.index({ department: 1, level: 1 })
CourseSchema.index({ semester: 1, year: 1 })
CourseSchema.index({ isActive: 1 })
CourseSchema.index({ title: 'text', description: 'text' })

AssignmentSchema.index({ courseId: 1, dueDate: 1 })
AssignmentSchema.index({ type: 1 })

UserCourseSchema.index({ userId: 1, academicYear: 1, semester: 1 })
UserCourseSchema.index({ courseId: 1, status: 1 })
UserCourseSchema.index({ userId: 1, status: 1 })

UserAssignmentSchema.index({ userId: 1, status: 1 })
UserAssignmentSchema.index({ assignmentId: 1 })
UserAssignmentSchema.index({ courseId: 1, status: 1 })

StudyPlanSchema.index({ userId: 1, isActive: 1 })
StudyPlanSchema.index({ academicYear: 1, semester: 1 })

AcademicRecordSchema.index({ userId: 1, academicYear: 1, semester: 1 })
AcademicRecordSchema.index({ userId: 1, status: 1 })

// Pre-save middleware
CourseSchema.pre('save', function(next) {
  if (this.currentEnrollments > this.maxStudents) {
    this.currentEnrollments = this.maxStudents
  }
  next()
})

UserAssignmentSchema.pre('save', async function(next) {
  // Auto-mark as overdue if past due date and not submitted
  if (this.status === 'pending' || this.status === 'in-progress') {
    try {
      const assignment = await mongoose.model('Assignment').findById(this.assignmentId)
      if (assignment && new Date() > assignment.dueDate) {
        this.status = 'overdue'
      }
    } catch (error) {
      // Continue without error if assignment lookup fails
    }
  }
  next()
})

// Virtual fields
CourseSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.currentEnrollments < this.maxStudents
})

CourseSchema.virtual('enrollmentPercentage').get(function() {
  return (this.currentEnrollments / this.maxStudents) * 100
})

UserCourseSchema.virtual('isCurrentSemester').get(function() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  let currentSemester = 'Fall'
  if (currentMonth >= 1 && currentMonth <= 5) {
    currentSemester = 'Spring'
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    currentSemester = 'Summer'
  }
  
  return this.academicYear === currentYear && this.semester === currentSemester
})

export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema)
export const UserCourse = mongoose.models.UserCourse || mongoose.model<IUserCourse>('UserCourse', UserCourseSchema)
export const UserAssignment = mongoose.models.UserAssignment || mongoose.model<IUserAssignment>('UserAssignment', UserAssignmentSchema)
export const StudyPlan = mongoose.models.StudyPlan || mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema)
export const AcademicRecord = mongoose.models.AcademicRecord || mongoose.model<IAcademicRecord>('AcademicRecord', AcademicRecordSchema) 