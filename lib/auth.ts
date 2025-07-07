import { NextAuthOptions } from 'next-auth'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { clientPromise } from './mongodb'
import bcrypt from 'bcrypt'
import connectToDatabase from './mongodb'
import mongoose from 'mongoose'

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectToDatabase()
          
          // Define User schema for MongoDB query
          const UserSchema = new mongoose.Schema({
            email: String,
            password: String,
            fullName: String,
            role: String,
            avatarUrl: String,
            isVerified: Boolean
          })
          
          const User = mongoose.models.User || mongoose.model('User', UserSchema)
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email })
          
          if (!user) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName || null,
            image: user.avatarUrl || null,
            role: user.role || 'guest',
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'guest'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role || 'guest'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
} 