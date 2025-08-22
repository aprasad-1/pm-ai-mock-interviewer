/**
 * Simple in-memory rate limiter for wallet operations
 * In production, use Redis or similar for distributed rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class WalletRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly MAX_REQUESTS_PER_MINUTE = 10
  private readonly WINDOW_MS = 60000 // 1 minute

  check(userId: string): boolean {
    const now = Date.now()
    const entry = this.limits.get(userId)

    // Clean up old entries
    if (entry && now > entry.resetTime) {
      this.limits.delete(userId)
    }

    // Check current entry
    const current = this.limits.get(userId)
    
    if (!current) {
      // First request
      this.limits.set(userId, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      })
      return true
    }

    if (current.count >= this.MAX_REQUESTS_PER_MINUTE) {
      console.warn(`⚠️ Rate limit exceeded for user ${userId}`)
      return false
    }

    // Increment count
    current.count++
    return true
  }

  reset(userId: string): void {
    this.limits.delete(userId)
  }
}

export const walletRateLimiter = new WalletRateLimiter()
