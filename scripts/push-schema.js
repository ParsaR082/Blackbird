const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function pushSchema() {
  try {
    console.log('📦 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Executing schema in Supabase...');
    
    // Note: Supabase doesn't provide a direct SQL execution method via the JS client
    // You'll need to run this SQL in the Supabase dashboard SQL editor
    console.log('\n⚠️  IMPORTANT: Supabase JS client doesn\'t support direct SQL execution.');
    console.log('📋 Please follow these steps:\n');
    console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Navigate to the SQL Editor');
    console.log('4. Copy and paste the contents of database/schema.sql');
    console.log('5. Click "Run" to execute the schema\n');
    console.log('✅ The schema file has been created at: database/schema.sql');
    console.log('\n🔐 Default admin credentials:');
    console.log('   Student ID: ADMIN001');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

pushSchema(); 