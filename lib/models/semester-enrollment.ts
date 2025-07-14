import mongoose from 'mongoose'

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

// Mongoose Schemas
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

// Ensure uniqueness of semester + year combination
SemesterSchema.index({ year: 1, term: 1 }, { unique: true })

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
    required: true
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
    default: 0
  },
  status: {
    type: String,
    enum: ['registered', 'in-progress', 'completed'],
    default: 'registered'
  },
  gpa: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Ensure a student can't enroll in the same semester twice
SemesterEnrollmentSchema.index({ userId: 1, semesterId: 1 }, { unique: true })

// Models
export const Semester = mongoose.models.Semester || mongoose.model('Semester', SemesterSchema)
export const SemesterEnrollment = mongoose.models.SemesterEnrollment || 
  mongoose.model('SemesterEnrollment', SemesterEnrollmentSchema) 