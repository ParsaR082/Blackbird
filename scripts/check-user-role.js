// scripts/check-user-role.js
require('dotenv').config({ path: '.env' })

const mongoose = require('mongoose')

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

async function checkUserRole() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@blackbird.com' })
    
    if (adminUser) {
      console.log('\n📋 User Details:')
      console.log('   Email:', adminUser.email)
      console.log('   Full Name:', adminUser.fullName)
      console.log('   Role:', adminUser.role)
      console.log('   Role Type:', typeof adminUser.role)
      console.log('   Is Verified:', adminUser.isVerified)
      console.log('   Created At:', adminUser.createdAt)
      console.log('   Updated At:', adminUser.updatedAt)
      
      // Check if role matches exactly
      console.log('\n🔍 Role Checks:')
      console.log('   role === "ADMIN":', adminUser.role === 'ADMIN')
      console.log('   role === "admin":', adminUser.role === 'admin')
      console.log('   role.toUpperCase() === "ADMIN":', adminUser.role?.toUpperCase() === 'ADMIN')
    } else {
      console.log('❌ Admin user not found!')
    }

    // List all users and their roles
    const allUsers = await User.find({}, 'email role fullName')
    console.log('\n👥 All Users:')
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - Role: "${user.role}" (${typeof user.role})`)
    })

    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkUserRole()