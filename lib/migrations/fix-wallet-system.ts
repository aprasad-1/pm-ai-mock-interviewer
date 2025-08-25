import { adminDb } from '@/firebase/admin'

/**
 * Migration to fix wallet system from unlimited (-1) to monthly allocation (100 minutes)
 * This prevents exploitation and implements proper SaaS billing practices
 */
export async function fixWalletSystemMigration() {
  console.log('🔄 Starting wallet system migration...')
  
  try {
    // Get all users with active subscriptions that have -1 wallet minutes
    const usersSnapshot = await adminDb.collection('users')
      .where('subscriptionStatus', '==', 'active')
      .where('walletMinutes', '==', -1)
      .get()

    console.log(`📋 Found ${usersSnapshot.size} users with unlimited minutes to migrate`)

    const batch = adminDb.batch()
    let migrationCount = 0

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const userId = userDoc.id

      console.log(`👤 Migrating user ${userId} (${userData.email})`)

      // Calculate appropriate wallet minutes based on subscription history
      // For users with -1 (unlimited), give them a reasonable starting amount
      let newWalletMinutes = 100 // Default for active Pro users
      
      // If they have usage history, be more generous
      if (userData.totalSecondsUsed && userData.totalSecondsUsed > 0) {
        const minutesUsed = Math.ceil(userData.totalSecondsUsed / 60)
        // Give them back what they used plus their monthly allocation
        newWalletMinutes = Math.max(minutesUsed + 100, 200)
        console.log(`  📊 User has used ${minutesUsed} minutes, giving ${newWalletMinutes} minutes`)
      } else if (userData.lastMonthlyReset) {
        const lastReset = userData.lastMonthlyReset.toDate()
        const now = new Date()
        const monthsSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24 * 30))
        
        // Give them their current month's allocation plus any missed months (up to 3 months back)
        const monthsToAdd = Math.min(monthsSinceReset + 1, 3)
        newWalletMinutes = monthsToAdd * 100
        
        console.log(`  📅 Last reset: ${lastReset.toISOString()}, adding ${monthsToAdd} months = ${newWalletMinutes} minutes`)
      }

      // Update the user with proper wallet system
      const updateData = {
        walletMinutes: newWalletMinutes,
        monthlyMinuteAllocation: 100,
        lastMonthlyReset: userData.lastMonthlyReset || new Date(),
        lastUpgradeBonus: new Date().toISOString(), // Track when they got their bonus
        updatedAt: new Date().toISOString(),
        // Add migration flag for tracking
        migratedWalletSystem: true,
        migratedAt: new Date().toISOString(),
      }

      batch.update(userDoc.ref, updateData)
      migrationCount++

      console.log(`  ✅ ${userId}: -1 → ${newWalletMinutes} minutes`)
    }

    // Also fix any canceled users who might have -1 minutes
    const canceledUsersSnapshot = await adminDb.collection('users')
      .where('subscriptionStatus', '==', 'canceled')
      .where('walletMinutes', '==', -1)
      .get()

    console.log(`📋 Found ${canceledUsersSnapshot.size} canceled users with unlimited minutes to fix`)

    for (const userDoc of canceledUsersSnapshot.docs) {
      const userData = userDoc.data()
      const userId = userDoc.id

      console.log(`👤 Fixing canceled user ${userId} (${userData.email})`)

      // Canceled users should keep some minutes but not unlimited
      const updateData = {
        walletMinutes: 50, // Give them some minutes as they were Pro users
        monthlyMinuteAllocation: 0, // No monthly allocation for canceled
        updatedAt: new Date().toISOString(),
        migratedWalletSystem: true,
        migratedAt: new Date().toISOString(),
      }

      batch.update(userDoc.ref, updateData)
      migrationCount++

      console.log(`  ✅ ${userId}: -1 → 50 minutes (canceled)`)
    }

    if (migrationCount > 0) {
      await batch.commit()
      console.log(`✅ Migration completed! Updated ${migrationCount} users`)
    } else {
      console.log('ℹ️ No users needed migration')
    }

    return {
      success: true,
      migratedUsers: migrationCount,
      message: `Successfully migrated ${migrationCount} users from unlimited to monthly allocation system`
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return {
      success: false,
      error: error.message,
      message: 'Migration failed'
    }
  }
}
