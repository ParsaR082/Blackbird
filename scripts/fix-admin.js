/**
 * Script to completely recreate the admin account with all required fields
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

async function fixAdminAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Find admin user
    const existingAdmin = await User.findOne({ email: 'admin@blackbird.com' });
    
    // Delete existing admin if found
    if (existingAdmin) {
      console.log('Deleting existing admin account...');
      await User.findByIdAndDelete(existingAdmin._id);
      console.log('Existing admin account deleted.');
    }
    
    // Create new admin user from scratch
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      email: 'admin@blackbird.com',
      password: hashedPassword,
      fullName: 'Blackbird Administrator',
      role: 'ADMIN',
      isVerified: true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    
    // Verify the new admin account
    const newAdmin = await User.findOne({ email: 'admin@blackbird.com' });
    
    if (!newAdmin) {
      console.error('❌ Failed to create admin account!');
      return;
    }
    
    console.log('✅ Admin account recreated successfully!');
    console.log('Admin account details:');
    console.log('- Email:', newAdmin.email);
    console.log('- Full Name:', newAdmin.fullName);
    console.log('- Role:', newAdmin.role);
    console.log('- Verified:', newAdmin.isVerified);
    console.log('- Password set:', !!newAdmin.password);
    console.log('- Password:', 'admin123');
    
  } catch (error) {
    console.error('❌ Error fixing admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixAdminAccount(); 