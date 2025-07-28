import mongoose from 'mongoose'

// Add User interface for API compatibility
export interface IUser {
  _id?: string
  fullName: string
  email: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
}

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

export interface ISemester {
  _id?: string
  year: number
  term: 'Fall' | 'Spring' | 'Summer'
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ISemesterEnrollment {
  _id?: string
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

// Course Schema
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

// Assignment Schema
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
    min: 0
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    }
  }]
}, {
  timestamps: true
})

// User Assignment Schema
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
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
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

// Study Plan Schema
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
    maxlength: 500
  }],
  targetGPA: {
    type: Number,
    min: 0,
    max: 4.0,
    default: 3.0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Academic Record Schema
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
      trim: true,
      maxlength: 2
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0
    },
    credits: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  semesterGPA: {
    type: Number,
    min: 0,
    max: 4.0,
    default: 0
  },
  cumulativeGPA: {
    type: Number,
    min: 0,
    max: 4.0,
    default: 0
  },
  totalCredits: {
    type: Number,
    min: 0,
    default: 0
  },
  completedCredits: {
    type: Number,
    min: 0,
    default: 0
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

// Semester Schema
const SemesterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  term: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Semester Enrollment Schema
const SemesterEnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  term: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  totalCredits: {
    type: Number,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['registered', 'in-progress', 'completed'],
    default: 'registered'
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes for better performance
CourseSchema.index({ courseCode: 1 })
CourseSchema.index({ department: 1, level: 1 })
CourseSchema.index({ semester: 1, year: 1 })
CourseSchema.index({ isActive: 1 })

AssignmentSchema.index({ courseId: 1, dueDate: 1 })
AssignmentSchema.index({ type: 1 })

UserAssignmentSchema.index({ userId: 1, status: 1 })
UserAssignmentSchema.index({ assignmentId: 1 })
UserAssignmentSchema.index({ courseId: 1 })

StudyPlanSchema.index({ userId: 1, isActive: 1 })
StudyPlanSchema.index({ academicYear: 1, semester: 1 })

AcademicRecordSchema.index({ userId: 1, academicYear: 1, semester: 1 })
AcademicRecordSchema.index({ userId: 1, status: 1 })

SemesterSchema.index({ year: 1, term: 1 })
SemesterSchema.index({ isActive: 1 })

SemesterEnrollmentSchema.index({ userId: 1, semesterId: 1, year: 1, term: 1 })
SemesterEnrollmentSchema.index({ userId: 1, status: 1 })

// Pre-save middleware
CourseSchema.pre('save', function(next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.isNew) {
    this.currentEnrollments = 0
  }
  next()
})

// Create models if they don't exist
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema)
export const UserAssignment = mongoose.models.UserAssignment || mongoose.model('UserAssignment', UserAssignmentSchema)
export const StudyPlan = mongoose.models.StudyPlan || mongoose.model('StudyPlan', StudyPlanSchema)
export const AcademicRecord = mongoose.models.AcademicRecord || mongoose.model('AcademicRecord', AcademicRecordSchema)
export const Semester = mongoose.models.Semester || mongoose.model('Semester', SemesterSchema)
export const SemesterEnrollment = mongoose.models.SemesterEnrollment || mongoose.model('SemesterEnrollment', SemesterEnrollmentSchema)