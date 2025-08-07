/**
 * Script to change a user's role
 * Usage: node scripts/change-user-role.js <email> <new_role>
 * Example: node scripts/change-user-role.js user@example.com ADMIN
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

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

async function changeUserRole() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length !== 2) {
      console.log('Usage: node scripts/change-user-role.js <email> <new_role>');
      console.log('Available roles: USER, ADMIN, MODERATOR, MANAGER, SUPER_ADMIN');
      console.log('Example: node scripts/change-user-role.js user@example.com ADMIN');
      process.exit(1);
    }

    const [email, newRole] = args;
    const validRoles = ['USER', 'ADMIN', 'MODERATOR', 'MANAGER', 'SUPER_ADMIN'];
    
    if (!validRoles.includes(newRole)) {
      console.error(`❌ Invalid role: ${newRole}`);
      console.log('Available roles:', validRoles.join(', '));
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Find the user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📋 Current User Details:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Full Name: ${user.fullName}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Is Verified: ${user.isVerified}`);

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        role: newRole,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`\n✅ User role updated successfully!`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Full Name: ${updatedUser.fullName}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   Updated At: ${updatedUser.updatedAt}`);
    
  } catch (error) {
    console.error('❌ Error changing user role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
changeUserRole();