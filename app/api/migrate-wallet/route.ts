import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/firebase/admin'
import { fixWalletSystemMigration } from '@/lib/migrations/fix-wallet-system'

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Wallet system migration requested')
    
    // Verify authentication (admin only)
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    console.log(`👤 Migration requested by user: ${decodedToken.uid}`)

    // Run the migration
    const result = await fixWalletSystemMigration()

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result
    })

  } catch (error: any) {
    console.error('❌ Migration API error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error.message
    }, { status: 500 })
  }
}
