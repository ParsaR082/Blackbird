const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to the blackbird database
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

async function createAdminUser() {
  try {
    console.log('Connecting to blackbird database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@blackbird.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.fullName}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Verified: ${existingAdmin.isVerified}`);
      return;
    }
    
    // Create admin user
    console.log('Creating admin user...');
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
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Admin Login Credentials:');
    console.log('Email: admin@blackbird.com');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now log in to your application!');
    
    // Also create the original user that was trying to log in
    console.log('\nCreating the original user account...');
    const userPassword = await bcrypt.hash('password123', 12); // Default password
    
    const originalUser = new User({
      email: 'Blackbirdhighsociety@gmail.com',
      password: userPassword,
      fullName: 'Blackbird User',
      role: 'USER',
      isVerified: true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await originalUser.save();
    console.log('✅ Original user account created!');
    console.log('');
    console.log('User Login Credentials:');
    console.log('Email: Blackbirdhighsociety@gmail.com');
    console.log('Password: password123');
    console.log('');
    console.log('Both accounts are now ready to use!');
    
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser(); 