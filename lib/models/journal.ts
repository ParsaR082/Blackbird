import mongoose from 'mongoose'

const JournalSchema = new mongoose.Schema({
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  author: { type: String, required: true }, // admin user id or username
  visibility: { type: String, enum: ['private', 'admins', 'custom'], default: 'private' },
  allowedAdmins: { type: [String], default: [] }, // user ids or usernames
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Journal || mongoose.model('Journal', JournalSchema) 