const mongoose = require('mongoose');

// Connect to the blackbird database specifically
const MONGODB_URI = 'mongodb+srv://Avestami:xKuiw9ie7AacuMrI@blackbird.3qpqiyp.mongodb.net/blackbird?retryWrites=true&w=majority&appName=blackbird';

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

async function checkBlackbirdDatabase() {
  try {
    console.log('Connecting to blackbird database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB via Mongoose');
    
    console.log(`\nCurrently connected to database: ${mongoose.connection.db.databaseName}`);
    
    // List all collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in blackbird database: ${collections.length}`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check document counts in each collection
    console.log('\nDocument counts per collection:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    
    // Try to find users
    const users = await User.find({}).select('-password').limit(10); // Get first 10 users, exclude password
    
    console.log('\n=== USERS IN BLACKBIRD DATABASE ===');
    console.log(`Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('No users found using the User schema.');
      
      // Check raw users collection
      const rawUsers = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
      console.log(`Raw users found: ${rawUsers.length}`);
      
      if (rawUsers.length > 0) {
        console.log('\nFirst few raw user documents:');
        rawUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${JSON.stringify(user, null, 2)}`);
        });
      }
    } else {
      console.log('\nUser list:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Full Name: ${user.fullName || 'N/A'}`);
        console.log(`   Role: ${user.role || 'USER'}`);
        console.log(`   Verified: ${user.isVerified || false}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
        console.log('   ---');
      });
      
      // Check for admin users
      const adminUsers = await User.find({ role: 'ADMIN' });
      console.log(`\nAdmin users found: ${adminUsers.length}`);
    }
    
    // Check for sessions
    const sessionCount = await mongoose.connection.db.collection('sessions').countDocuments();
    console.log(`\nSessions in database: ${sessionCount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkBlackbirdDatabase(); 