/**
 * Script to create multiple admin users
 * Run with: node scripts/create-admin-users.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin users to create
const adminUsers = [
  {
    email: 'admin@blackbird.com',
    password: 'Admin@123456',
    fullName: 'Main Admin',
    role: 'ADMIN',
    isVerified: true
  },
  {
    email: 'admin2@blackbird.com',
    password: 'Admin@123456',
    fullName: 'Secondary Admin',
    role: 'ADMIN',
    isVerified: true
  },
  {
    email: 'superadmin@blackbird.com',
    password: 'SuperAdmin@123456',
    fullName: 'Super Admin',
    role: 'ADMIN',
    isVerified: true
  }
];

async function createAdminUsers() {
  console.log('Creating admin users...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    console.log('Please set the DATABASE_URL environment variable and try again.');
    process.exit(1);
  }
  
  try {
    const prisma = new PrismaClient();
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Create each admin user
    for (const userData of adminUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          console.log(`User ${userData.email} already exists, updating to admin role...`);
          
          // Update user to admin role
          await prisma.user.update({
            where: { email: userData.email },
            data: {
              role: 'ADMIN',
              isVerified: true
            }
          });
          
          console.log(`✅ Updated ${userData.email} to admin role`);
        } else {
          // Hash the password
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          // Create the user
          const newUser = await prisma.user.create({
            data: {
              email: userData.email,
              password: hashedPassword,
              fullName: userData.fullName,
              role: userData.role,
              isVerified: userData.isVerified
            }
          });
          
          console.log(`✅ Created admin user: ${userData.email}`);
          console.log(`   ID: ${newUser.id}`);
          console.log(`   Password: ${userData.password}`);
        }
      } catch (error) {
        console.error(`❌ Error creating/updating user ${userData.email}:`, error);
      }
    }
    
    // Disconnect from the database
    await prisma.$disconnect();
    console.log('✅ Admin users created successfully');
    
    // Print credentials for reference
    console.log('\nAdmin Credentials:');
    adminUsers.forEach(user => {
      console.log(`- Email: ${user.email} | Password: ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUsers();