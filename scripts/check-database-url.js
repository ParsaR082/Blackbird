const mongoose = require('mongoose');

// Check current environment variables
console.log('=== Database URL Check ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

// Test different database URLs
const testUrls = [
  process.env.DATABASE_URL,
  process.env.MONGODB_URI,
  'mongodb+srv://Avestami:xKuiw9ie7AacuMrI@blackbird.3qpqiyp.mongodb.net/blackbird-portal?retryWrites=true&w=majority&appName=blackbird',
  'mongodb+srv://Avestami:xKuiw9ie7AacuMrI@blackbird.3qpqiyp.mongodb.net/blackbird?retryWrites=true&w=majority&appName=blackbird'
];

async function testConnection(url, name) {
  if (!url) {
    console.log(`❌ ${name}: No URL provided`);
    return false;
  }

  try {
    console.log(`🔍 Testing ${name}: ${url.substring(0, 50)}...`);
    
    // Parse URL to check database name
    const urlObj = new URL(url);
    const dbName = urlObj.pathname.substring(1); // Remove leading slash
    
    if (!dbName) {
      console.log(`❌ ${name}: No database name in URL`);
      return false;
    }
    
    console.log(`✅ ${name}: Database name = "${dbName}"`);
    
    // Test connection
    await mongoose.connect(url, { 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000 
    });
    
    console.log(`✅ ${name}: Connection successful`);
    
    // Check if database exists
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    const dbExists = dbs.databases.some(db => db.name === dbName);
    
    if (dbExists) {
      console.log(`✅ ${name}: Database "${dbName}" exists`);
    } else {
      console.log(`⚠️  ${name}: Database "${dbName}" does not exist`);
    }
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ ${name}: Connection failed - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n=== Testing Database Connections ===\n');
  
  let workingUrl = null;
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    const name = `URL ${i + 1}`;
    
    if (await testConnection(url, name)) {
      workingUrl = url;
      console.log(`\n🎉 Found working URL: ${url.substring(0, 50)}...`);
      break;
    }
    
    console.log('');
  }
  
  if (workingUrl) {
    console.log('\n=== Recommendation ===');
    console.log('Set your DATABASE_URL environment variable to:');
    console.log(workingUrl);
    console.log('\nOr add to your .env file:');
    console.log(`DATABASE_URL="${workingUrl}"`);
  } else {
    console.log('\n❌ No working database URL found!');
    console.log('Please check your MongoDB connection string.');
  }
}

main().catch(console.error); 