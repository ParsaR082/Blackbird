import mongoose from 'mongoose';

/**
 * Teacher Inbox interface for TypeScript
 */
export interface ITeacherInbox {
  _id?: string;
  teacherId: string;
  fromUserId: string;
  courseId: string;
  text: string;
  rawText?: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Teacher Inbox Schema for MongoDB
 */
const TeacherInboxSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  text: {
    type: String,
    required: true,
    maxlength: 4000
  },
  rawText: {
    type: String,
    maxlength: 4000
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
TeacherInboxSchema.index({ teacherId: 1, status: 1 });
TeacherInboxSchema.index({ fromUserId: 1 });
TeacherInboxSchema.index({ courseId: 1 });
TeacherInboxSchema.index({ createdAt: -1 });

/**
 * Export the Teacher Inbox model
 */
export const TeacherInbox = mongoose.models.TeacherInbox || mongoose.model('TeacherInbox', TeacherInboxSchema); 