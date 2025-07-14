import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session_token')?.value
    const allCookies = cookies().getAll()
    const headers = Object.fromEntries(request.headers.entries())
    
    return NextResponse.json({
      sessionToken: sessionToken ? `${sessionToken.substring(0, 8)}...` : null,
      allCookies: allCookies.map(c => ({ name: c.name, value: c.value ? `${c.value.substring(0, 8)}...` : null })),
      headers: {
        host: headers.host,
        'user-agent': headers['user-agent'],
        origin: headers.origin,
        referer: headers.referer
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    })
  } catch (error) {
    console.error('[Debug] Error:', error)
    return NextResponse.json(
      { error: 'Debug error' },
      { status: 500 }
    )
  }
} 