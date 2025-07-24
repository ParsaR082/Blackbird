const mongoose = require('mongoose');

// Use the actual MongoDB URI provided by the user
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Avestami:xKuiw9ie7AacuMrI@blackbird.3qpqiyp.mongodb.net/blackbird-portal?retryWrites=true&w=majority&appName=blackbird';

// Define User schema (same as in your app)
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

const User = mongoose.model('User', UserSchema);

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // First, let's see what databases exist
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    // Check current database name
    
    // List all collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const users = await User.find({}).select('-password'); // Exclude password for security
    
    if (users.length === 0) {
      
      // Let's check if there are any documents in the users collection using raw MongoDB
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      
      // Check for any collections that might contain user data
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      }
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Full Name: ${user.fullName || 'N/A'}`);
        console.log(`   Role: ${user.role || 'USER'}`);
        console.log(`   Verified: ${user.isVerified || false}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
        console.log(`   Updated: ${user.updatedAt || 'N/A'}`);
        console.log(`   Avatar URL: ${user.avatarUrl || 'N/A'}`);
        console.log('   ---');
      });
    }
    
    // Also check for any admin users
    const adminUsers = await User.find({ role: 'ADMIN' });
    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`Admin ${index + 1}: ${admin.email} (${admin.fullName})`);
      });
    }
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
    } else if (error.message.includes('authentication failed')) {
    } else if (error.message.includes('network')) {
    }
  } finally {
    await mongoose.disconnect();
  }
}

listUsers(); 