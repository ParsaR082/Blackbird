const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  process.exit(1);
}

async function setupDatabase() {
  const client = new MongoClient(mongodbUri);
  
  try {
    await client.connect();
    
    const db = client.db();

    console.log('📦 Setting up collections and indexes...');
    
    // Create Users collection with indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Create UserVerifications collection with indexes
    const verificationsCollection = db.collection('userverifications');
    await verificationsCollection.createIndex({ userId: 1 }, { unique: true });
    await verificationsCollection.createIndex({ token: 1 }, { unique: true });

    // Create Sessions collection with indexes
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.createIndex({ userId: 1 });
    await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      email: 'admin@blackbird.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
      avatarUrl: null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await usersCollection.insertOne(adminUser);
      console.log('✅ Default admin user created successfully!');
      console.log('\n🔐 Default admin credentials:');
      console.log('   Email: admin@blackbird.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️  Admin user already exists, skipping...');
      } else {
        throw error;
      }
    }

    console.log('🎉 MongoDB setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up MongoDB:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupDatabase(); 