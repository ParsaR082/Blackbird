export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { validateSuperAdmin } from '@/lib/server-utils'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// Hidden super admin endpoint handler
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Check if this is our hidden endpoint
    const path = params.path.join('/')
    if (path !== 'dmig991100293848') {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    // Validate super admin access
    const validation = await validateSuperAdmin(request)
    if (!validation.isValid) {
      // Return 404 to hide the endpoint existence
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    await connectToDatabase()

    // Get all collections from the database
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()

    const fullExport: any = {
      exportedAt: new Date().toISOString(),
      exportedBy: validation.user?.id || 'unknown',
      collections: {}
    }

    // Export each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      
      try {
        const collection = db.collection(collectionName)
        let documents = await collection.find({}).toArray()

        // Special handling for users collection - decrypt passwords
        if (collectionName === 'users') {
          // For users, we'll export with original passwords (this is dangerous but requested)
          // Note: In practice, original passwords cannot be recovered from bcrypt hashes
          // We'll export the hashed passwords with a note
          documents = documents.map(user => ({
            ...user,
            password_note: 'BCRYPT_HASH_CANNOT_BE_DECRYPTED',
            password_hash: user.password, // Keep the hash for import
            // Mark super admins as protected
            is_protected_super_admin: user.role === 'SUPER_ADMIN'
          }))
        }

        // Convert MongoDB ObjectIds to strings for JSON serialization
        documents = JSON.parse(JSON.stringify(documents))

        fullExport.collections[collectionName] = {
          count: documents.length,
          documents: documents
        }
      } catch (collectionError: any) {
        console.error(`Error exporting collection ${collectionName}:`, collectionError)
        fullExport.collections[collectionName] = {
          error: collectionError.message || 'Failed to export collection',
          count: 0,
          documents: []
        }
      }
    }

    // Add metadata
    fullExport.metadata = {
      databaseName: db.databaseName,
      totalCollections: collections.length,
      nodeVersion: process.version,
      mongooseVersion: mongoose.version,
      exportFormat: 'BLACKBIRD_FULL_DB_EXPORT_V1'
    }

    // Set appropriate headers for download
    const filename = `blackbird_db_export_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`
    
    return new NextResponse(JSON.stringify(fullExport, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Database export error:', error)
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
}

// Import endpoint (also hidden)
export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Check if this is our hidden endpoint
    const path = params.path.join('/')
    if (path !== 'dmig991100293848') {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    // Validate super admin access
    const validation = await validateSuperAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const importData = await request.json()

    // Validate import format
    if (!importData.metadata || importData.metadata.exportFormat !== 'BLACKBIRD_FULL_DB_EXPORT_V1') {
      return NextResponse.json({ 
        error: 'Invalid import format' 
      }, { status: 400 })
    }

    await connectToDatabase()
    const db = mongoose.connection.db

    const importResults: any = {
      importedAt: new Date().toISOString(),
      importedBy: validation.user?.id || 'unknown',
      results: {}
    }

    // Clear existing collections (dangerous operation)
    const confirmClear = request.headers.get('X-Confirm-Clear-Database')
    if (confirmClear !== 'YES_CLEAR_ALL_DATA') {
      return NextResponse.json({
        error: 'Database clear confirmation required',
        required_header: 'X-Confirm-Clear-Database: YES_CLEAR_ALL_DATA'
      }, { status: 400 })
    }

    // Import each collection
    for (const [collectionName, collectionData] of Object.entries(importData.collections)) {
      try {
        const data = collectionData as any
        
        if (!data.documents || !Array.isArray(data.documents)) {
          continue
        }

        // Drop existing collection
        try {
          await db.collection(collectionName).drop()
        } catch (dropError) {
          // Collection might not exist, continue
        }

        let documents = data.documents

        // Special handling for users collection
        if (collectionName === 'users') {
          documents = documents.map((user: any) => {
            // Remove our export metadata
            const { password_note, password_hash, is_protected_super_admin, ...cleanUser } = user
            
            // Use the hash directly (passwords were already hashed)
            if (password_hash) {
              cleanUser.password = password_hash
            }

            return cleanUser
          })
        }

        // Convert string IDs back to ObjectIds where needed
        documents = documents.map((doc: any) => {
          if (doc._id && typeof doc._id === 'string') {
            try {
              doc._id = new mongoose.Types.ObjectId(doc._id)
            } catch (e) {
              // Keep as string if conversion fails
            }
          }
          return doc
        })

        // Insert documents
        if (documents.length > 0) {
          await db.collection(collectionName).insertMany(documents)
        }

        importResults.results[collectionName] = {
          success: true,
          imported: documents.length
        }

      } catch (collectionError: any) {
        console.error(`Error importing collection ${collectionName}:`, collectionError)
        importResults.results[collectionName] = {
          success: false,
          error: collectionError.message || 'Failed to import collection',
          imported: 0
        }
      }
    }

    return NextResponse.json(importResults)

  } catch (error) {
    console.error('Database import error:', error)
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
} 