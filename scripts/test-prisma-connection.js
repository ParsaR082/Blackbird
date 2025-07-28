const { PrismaClient } = require('../generated/prisma');

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mongodb+srv://Avestami:xKuiw9ie7AacuMrI@blackbird.3qpqiyp.mongodb.net/blackbird-portal?retryWrites=true&w=majority&appName=blackbird";
}

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    console.log('🔍 Testing Prisma connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connection successful');
    
    // Test creating a game
    const testGame = await prisma.game.create({
      data: {
        title: 'Test Game',
        description: 'This is a test game for connection testing',
        link: 'https://example.com',
        category: 'test',
        color: '#000000',
        isMultiplayer: false,
      },
    });
    
    console.log('✅ Game created successfully:', testGame.id);
    
    // Clean up - delete the test game
    await prisma.game.delete({
      where: { id: testGame.id }
    });
    
    console.log('✅ Test game deleted successfully');
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    
    if (error.code === 'P2010') {
      console.error('This is a database connection error. Check your DATABASE_URL.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection(); 