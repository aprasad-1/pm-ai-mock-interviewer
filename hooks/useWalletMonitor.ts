'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserProfile } from '@/lib/actions/user.action'

export function useWalletMonitor(userId: string) {
  const [walletMinutes, setWalletMinutes] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<number>(Date.now())

  const checkWalletBalance = useCallback(async () => {
    try {
      const profile = await getUserProfile()
      setWalletMinutes(profile.walletMinutes)
      setLastChecked(Date.now())
      console.log(`💰 Wallet check: ${profile.walletMinutes} minutes remaining`)
      return profile.walletMinutes
    } catch (error) {
      console.error('Error checking wallet:', error)
      return walletMinutes // Return cached value on error
    } finally {
      setIsLoading(false)
    }
  }, [walletMinutes])

  // Initial load
  useEffect(() => {
    checkWalletBalance()
  }, [userId])

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkWalletBalance()
    }, 30000)

    return () => clearInterval(interval)
  }, [checkWalletBalance])

  const refreshWallet = useCallback(() => {
    return checkWalletBalance()
  }, [checkWalletBalance])

  const hasMinutes = walletMinutes > 0
  const isLowBalance = walletMinutes <= 5 && walletMinutes > 0
  const isCriticalBalance = walletMinutes <= 1 && walletMinutes > 0

  return {
    walletMinutes,
    hasMinutes,
    isLowBalance,
    isCriticalBalance,
    isLoading,
    lastChecked,
    refreshWallet
  }
}
