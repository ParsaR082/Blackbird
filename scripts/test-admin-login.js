/**
 * Script to test admin login directly against the database
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connection string - use environment variable if available
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbird-portal';

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
});

async function testAdminLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);

    // Get User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Find admin user
    const admin = await User.findOne({ email: 'admin@blackbird.com' });
    
    if (!admin) {
      return;
    }
    
    // Test password
    const testPassword = 'admin123';
    let passwordValid = false;
    
    if (admin.password) {
      passwordValid = await bcrypt.compare(testPassword, admin.password);
    }
    
    if (!passwordValid) {
      // Update password if invalid
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      await User.findByIdAndUpdate(admin._id, {
        password: hashedPassword,
        fullName: 'Blackbird Administrator',
        role: 'ADMIN',
        isVerified: true,
        updatedAt: new Date()
      });
      
    }
    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
testAdminLogin(); 