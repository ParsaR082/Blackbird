const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Connection string - replace with your actual MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbird-portal'

// User schema
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

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get or create User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@blackbird.com' })
    
    if (existingAdmin) {
      // Update existing admin user with proper password
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        fullName: 'Blackbird Administrator',
        role: 'ADMIN',
        isVerified: true,
        updatedAt: new Date()
      })
      
      console.log('✅ Admin user updated successfully!')
      console.log('Email: admin@blackbird.com')
      console.log('Password: admin123')
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const adminUser = new User({
        email: 'admin@blackbird.com',
        password: hashedPassword,
        fullName: 'Blackbird Administrator',
        role: 'ADMIN',
        isVerified: true,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await adminUser.save()
      console.log('✅ Admin user created successfully!')
      console.log('Email: admin@blackbird.com')
      console.log('Password: admin123')
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
createAdminUser() 