// scripts/clear-and-create-admin.js
require('dotenv').config({ path: '.env' })
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env.new' })

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO')))
  throw new Error('Please define the MONGODB_URI environment variable in one of: .env, .env.local, or .env.new')
}

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  fullName: String,
  role: String,
  isVerified: Boolean,
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  // Delete all users
  await User.deleteMany({})
  console.log('All users deleted.')

  // Generate a strong random password
  const password = crypto.randomBytes(16).toString('base64')
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create the admin user
  const admin = new User({
    email: 'blackbirdhighsociety@gmail.com',
    password: hashedPassword,
    fullName: 'Blackbird Admin',
    role: 'ADMIN',
    isVerified: true,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  await admin.save()
  console.log('Admin user created: blackbirdhighsociety@gmail.com')
  console.log('Admin password:', password)

  await mongoose.disconnect()
  console.log('Disconnected from MongoDB')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
}) 