import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          student_id: string
          username: string
          mobile_phone: string
          full_name: string
          role: 'user' | 'admin'
          is_verified: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          student_id: string
          username: string
          mobile_phone: string
          full_name: string
          password_hash: string
          role?: 'user' | 'admin'
          is_verified?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          student_id?: string
          username?: string
          mobile_phone?: string
          full_name?: string
          password_hash?: string
          role?: 'user' | 'admin'
          is_verified?: boolean
          avatar_url?: string | null
          updated_at?: string
          last_login?: string | null
        }
      }
      user_verifications: {
        Row: {
          id: string
          user_id: string
          verified_by: string | null
          verified_at: string
          verification_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          verified_by?: string | null
          verified_at?: string
          verification_notes?: string | null
        }
        Update: {
          user_id?: string
          verified_by?: string | null
          verified_at?: string
          verification_notes?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          user_id?: string
          token?: string
          expires_at?: string
        }
      }
    }
    Functions: {
      authenticate_user: {
        Args: {
          p_identifier: string
          p_password: string
        }
        Returns: {
          user_id: string
          username: string
          full_name: string
          role: 'user' | 'admin'
          is_verified: boolean
          avatar_url: string | null
        }[]
      }
    }
  }
}

export { createClient } 