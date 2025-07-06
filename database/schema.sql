-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS user_verifications CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  mobile_phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create user verifications table
CREATE TABLE user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_notes TEXT,
  CONSTRAINT fk_user_verification FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_mobile_phone ON users(mobile_phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Create RLS policies for user_verifications table
CREATE POLICY "Admins can view all verifications" ON user_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert verifications" ON user_verifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Create RLS policies for sessions table
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user authentication
CREATE OR REPLACE FUNCTION authenticate_user(
  p_identifier TEXT, -- can be student_id, username, or mobile_phone
  p_password TEXT
)
RETURNS TABLE (
  user_id UUID,
  username VARCHAR,
  full_name VARCHAR,
  role user_role,
  is_verified BOOLEAN,
  avatar_url TEXT
) AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Find user by identifier (student_id, username, or mobile_phone)
  SELECT * INTO v_user_record
  FROM users
  WHERE student_id = p_identifier 
     OR username = p_identifier 
     OR mobile_phone = p_identifier;
  
  -- Check if user exists and password matches
  IF v_user_record.id IS NOT NULL AND 
     v_user_record.password_hash = crypt(p_password, v_user_record.password_hash) THEN
    
    -- Update last login
    UPDATE users SET last_login = NOW() WHERE id = v_user_record.id;
    
    -- Return user data
    RETURN QUERY
    SELECT 
      v_user_record.id,
      v_user_record.username,
      v_user_record.full_name,
      v_user_record.role,
      v_user_record.is_verified,
      v_user_record.avatar_url;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a default admin user (password: admin123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO users (
  student_id,
  username,
  mobile_phone,
  full_name,
  password_hash,
  role,
  is_verified
) VALUES (
  'ADMIN001',
  'admin',
  '+1234567890',
  'System Administrator',
  crypt('admin123', gen_salt('bf')),
  'admin',
  true
) ON CONFLICT (student_id) DO NOTHING; 