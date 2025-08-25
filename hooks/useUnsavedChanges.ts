'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean
  message?: string
}

export function useUnsavedChanges({ 
  hasUnsavedChanges, 
  message = 'You have unsaved changes. Are you sure you want to leave?' 
}: UseUnsavedChangesProps) {
  const router = useRouter()

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])

  // Custom navigation handler that warns about unsaved changes
  const navigateWithWarning = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(message)
      if (confirmed) {
        router.push(path)
      }
    } else {
      router.push(path)
    }
  }, [hasUnsavedChanges, message, router])

  return { navigateWithWarning }
}
