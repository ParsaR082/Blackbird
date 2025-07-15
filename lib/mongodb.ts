import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// MongoDB Client for NextAuth
import { MongoClient } from 'mongodb'

const client = new MongoClient(MONGODB_URI!)
const clientPromise = client.connect()

export { clientPromise }

// Database types for the application
export interface UserDocument {
  _id: string
  email: string
  password: string
  fullName?: string
  role: 'ADMIN' | 'MODERATOR' | 'USER' | 'GUEST'
  avatarUrl?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserVerificationDocument {
  _id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface SessionDocument {
  _id: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

export type Database = {
  users: UserDocument[]
  userVerifications: UserVerificationDocument[]
  sessions: SessionDocument[]
} 