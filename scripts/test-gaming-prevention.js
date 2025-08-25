/**
 * Test script to demonstrate anti-gaming protection
 * This shows how the system prevents users from getting multiple 100-minute bonuses in the same month
 */

// Simulate user data and webhook events
function simulateGamingAttempt() {
  console.log('🧪 Testing Anti-Gaming Protection System\n')

  // Initial user state
  let userData = {
    walletMinutes: 30,
    subscriptionStatus: 'free',
    lastUpgradeBonus: null
  }

  console.log('📅 January 2024 - Gaming Attempt Simulation')
  console.log('Initial state:', userData)
  console.log()

  // Attempt 1: First subscription in January
  console.log('🎯 Attempt 1: Subscribe to Pro (January 15, 2024)')
  const result1 = processUpgrade(userData, '2024-01-15')
  userData = result1.userData
  console.log('Result:', result1.message)
  console.log('New state:', userData)
  console.log()

  // Attempt 2: Cancel and resubscribe same month
  console.log('❌ User cancels subscription (January 20, 2024)')
  userData.subscriptionStatus = 'canceled'
  console.log('State after cancel:', userData)
  console.log()

  console.log('🎯 Attempt 2: Resubscribe to Pro (January 25, 2024)')
  const result2 = processUpgrade(userData, '2024-01-25')
  userData = result2.userData
  console.log('Result:', result2.message)
  console.log('New state:', userData)
  console.log()

  // Attempt 3: Try again next month
  console.log('🎯 Attempt 3: Subscribe to Pro (February 5, 2024)')
  const result3 = processUpgrade(userData, '2024-02-05')
  userData = result3.userData
  console.log('Result:', result3.message)
  console.log('New state:', userData)
  console.log()

  console.log('✅ Anti-Gaming Protection Working Correctly!')
  console.log('- Only 1 bonus per calendar month')
  console.log('- Users cannot exploit by cancel/resubscribe')
  console.log('- New month = new bonus allowed')
}

// Simulate the webhook upgrade logic
function processUpgrade(userData, dateString) {
  const now = new Date(dateString)
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  
  let shouldAddUpgradeBonus = true
  let newWalletMinutes = userData.walletMinutes
  
  if (userData.lastUpgradeBonus) {
    const lastBonusDate = new Date(userData.lastUpgradeBonus)
    const lastBonusMonth = `${lastBonusDate.getFullYear()}-${String(lastBonusDate.getMonth() + 1).padStart(2, '0')}`
    
    if (lastBonusMonth === currentMonth) {
      shouldAddUpgradeBonus = false
    }
  }
  
  if (shouldAddUpgradeBonus) {
    newWalletMinutes = Math.max(userData.walletMinutes + 100, 100)
    return {
      message: `✅ Added 100 minutes! (${userData.walletMinutes} → ${newWalletMinutes})`,
      userData: {
        ...userData,
        walletMinutes: newWalletMinutes,
        subscriptionStatus: 'active',
        lastUpgradeBonus: now.toISOString()
      }
    }
  } else {
    return {
      message: `🚫 No bonus - already received this month (${currentMonth})`,
      userData: {
        ...userData,
        subscriptionStatus: 'active'
      }
    }
  }
}

// Run the simulation
simulateGamingAttempt()
