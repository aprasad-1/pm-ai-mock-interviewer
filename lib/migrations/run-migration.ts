'use server'

import { adminDb } from '@/firebase/admin'

export async function runMigration() {
  try {
    console.log('🔄 Starting migration for existing users...')
    
    const usersSnapshot = await adminDb.collection('users').get()
    let migratedCount = 0
    let errors = 0
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data()
        
        // Check if user already has the new fields
        if (!userData.hasOwnProperty('subscriptionStatus') || !userData.hasOwnProperty('walletMinutes')) {
          const updateData: any = {}
          
          // Add missing fields with default values
          if (!userData.hasOwnProperty('subscriptionStatus')) {
            updateData.subscriptionStatus = 'free'
          }
          
          if (!userData.hasOwnProperty('walletMinutes')) {
            updateData.walletMinutes = 30
          }
          
          if (!userData.hasOwnProperty('updatedAt')) {
            updateData.updatedAt = new Date().toISOString()
          }
          
          // Update the user document
          await adminDb.collection('users').doc(userDoc.id).update(updateData)
          migratedCount++
          
          console.log(`✅ Migrated user: ${userDoc.id}`)
        } else {
          console.log(`ℹ️ User already migrated: ${userDoc.id}`)
        }
      } catch (error) {
        console.error(`❌ Error migrating user ${userDoc.id}:`, error)
        errors++
      }
    }
    
    console.log(`🎉 Migration completed! ${migratedCount} users updated, ${errors} errors.`)
    return { 
      success: true, 
      migratedCount,
      errors,
      totalUsers: usersSnapshot.size
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw new Error('Failed to migrate existing users')
  }
}
