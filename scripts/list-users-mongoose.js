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
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB via Mongoose');
    
    // First, let's see what databases exist
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check current database name
    console.log(`\nCurrently connected to database: ${mongoose.connection.db.databaseName}`);
    
    // List all collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in current database: ${collections.length}`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    const users = await User.find({}).select('-password'); // Exclude password for security
    
    console.log('\n=== DATABASE USERS (via Mongoose) ===');
    console.log(`Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('Your database appears to be empty or users are in a different collection.');
      
      // Let's check if there are any documents in the users collection using raw MongoDB
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`Raw user count in 'users' collection: ${userCount}`);
      
      // Check for any collections that might contain user data
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`${collection.name}: ${count} documents`);
      }
    } else {
      console.log('\nUser list:');
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
    console.log(`\nAdmin users found: ${adminUsers.length}`);
    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`Admin ${index + 1}: ${admin.email} (${admin.fullName})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Cannot connect to MongoDB. Make sure MongoDB is running.');
    } else if (error.message.includes('authentication failed')) {
      console.error('Authentication failed. Check your username and password.');
    } else if (error.message.includes('network')) {
      console.error('Network error. Check your internet connection.');
    }
  } finally {
    await mongoose.disconnect();
  }
}

listUsers(); 