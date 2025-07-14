/**
 * Script to test admin login directly against the database
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connection string - use environment variable if available
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbird-portal';
console.log('Using MongoDB URI:', MONGODB_URI);

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
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Find admin user
    const admin = await User.findOne({ email: 'admin@blackbird.com' });
    
    if (!admin) {
      console.error('❌ Admin user not found!');
      return;
    }
    
    console.log('Admin user found:');
    console.log('- Email:', admin.email);
    console.log('- Full Name:', admin.fullName);
    console.log('- Role:', admin.role);
    console.log('- Verified:', admin.isVerified);
    console.log('- Password set:', !!admin.password);
    
    // Test password
    const testPassword = 'admin123';
    let passwordValid = false;
    
    if (admin.password) {
      passwordValid = await bcrypt.compare(testPassword, admin.password);
    }
    
    console.log('- Password "admin123" valid:', passwordValid);
    
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
      
      console.log('✅ Admin password updated to "admin123"');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
testAdminLogin(); 