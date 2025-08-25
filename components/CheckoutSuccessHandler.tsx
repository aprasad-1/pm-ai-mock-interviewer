'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    if (isSuccess && !isRefreshing) {
      setIsRefreshing(true)
      
      // Show success message immediately
      toast.success('🎉 Welcome to Pro! Your minutes have been added.', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-success-200" />,
      })

      // Wait a moment for webhook to process, then refresh
      const refreshTimer = setTimeout(() => {
        console.log('🔄 Refreshing page to show updated subscription status...')
        
        // Remove success param and refresh
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
        
        // Force a hard refresh to ensure server components update
        window.location.reload()
      }, 2000)

      return () => clearTimeout(refreshTimer)
    }
  }, [isSuccess, isRefreshing, router])

  return null
}
