const { MongoClient } = require('mongodb');

// MongoDB connection URL - update this to match your database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbird';

async function listUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    
    console.log('\n=== DATABASE USERS ===');
    console.log(`Total users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('\nUser list:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Full Name: ${user.fullName || 'N/A'}`);
        console.log(`   Role: ${user.role || 'N/A'}`);
        console.log(`   Verified: ${user.isVerified || false}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
        console.log(`   Has Password: ${!!user.password}`);
        console.log('   ---');
      });
    }
    
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await client.close();
  }
}

listUsers(); 