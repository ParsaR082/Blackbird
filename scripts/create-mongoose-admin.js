// scripts/create-mongoose-admin.js
require('dotenv').config({ path: '.env' })

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env')
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

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@blackbird.com' })
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating...')
      // Update existing admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        fullName: 'Blackbird Admin',
        role: 'ADMIN',
        isVerified: true,
        updatedAt: new Date()
      })
      console.log('✅ Admin user updated successfully!')
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const admin = new User({
        email: 'admin@blackbird.com',
        password: hashedPassword,
        fullName: 'Blackbird Admin',
        role: 'ADMIN',
        isVerified: true,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await admin.save()
      console.log('✅ Admin user created successfully!')
    }

    console.log('\n🔐 Admin Credentials:')
    console.log('   Email: admin@blackbird.com')
    console.log('   Password: admin123')

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()