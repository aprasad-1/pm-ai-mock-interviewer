'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateUserProfile } from '@/lib/actions/user.action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertCircle, Check, RotateCcw, Save, User } from 'lucide-react'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import Image from 'next/image'

interface ProfileFormProps {
  currentName: string
  currentEmail: string
  currentPhotoURL?: string
}

const initialState = {
  message: '',
  errors: {} as Record<string, string[]>
}

function SubmitButton({ hasChanges, isValid }: { hasChanges: boolean, isValid: boolean }) {
  const { pending } = useFormStatus()
  
  if (!hasChanges) {
    return (
      <div className="flex items-center justify-center py-2 text-sm text-light-600">
        <Check className="w-4 h-4 mr-2" />
        No changes to save
      </div>
    )
  }
  
  return (
    <Button 
      type="submit" 
      disabled={pending || !isValid} 
      className="w-full"
    >
      <Save className="w-4 h-4 mr-2" />
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  )
}

export default function ProfileForm({ currentName, currentEmail, currentPhotoURL }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfile, initialState)
  const [formData, setFormData] = useState({
    displayName: currentName,
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  // Use unsaved changes hook
  useUnsavedChanges({ 
    hasUnsavedChanges: hasChanges,
    message: 'You have unsaved profile changes. Are you sure you want to leave?'
  })

  // Track changes
  useEffect(() => {
    const nameChanged = formData.displayName.trim() !== currentName.trim()
    setHasChanges(nameChanged)
  }, [formData.displayName, currentName])

  // Validate form
  useEffect(() => {
    const errors: Record<string, string> = {}
    
    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (formData.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters'
    } else if (formData.displayName.trim().length > 50) {
      errors.displayName = 'Display name must be less than 50 characters'
    }

    setValidationErrors(errors)
    setIsValid(Object.keys(errors).length === 0)
  }, [formData.displayName])

  // Handle successful form submission
  useEffect(() => {
    if (state.message) {
      if (state.message.includes('successfully')) {
        toast.success(state.message)
        // Reset change tracking after successful save
        setHasChanges(false)
      } else {
        toast.error(state.message)
      }
    }
  }, [state.message])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  const handleReset = useCallback(() => {
    setFormData({
      displayName: currentName,
    })
    setHasChanges(false)
    setValidationErrors({})
  }, [currentName])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges && isValid) {
          // Trigger form submission
          const form = document.getElementById('profile-form') as HTMLFormElement
          if (form) {
            form.requestSubmit()
          }
        }
      }
      
      // Escape to reset changes
      if (e.key === 'Escape' && hasChanges) {
        e.preventDefault()
        const confirmed = window.confirm('Reset all changes?')
        if (confirmed) {
          handleReset()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, isValid, handleReset])

  return (
    <div className="space-y-6">
      {/* Profile Photo Display (Read-only) */}
      <div className="text-center">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-dark-300 border-4 border-light-800 shadow-lg mx-auto">
          {currentPhotoURL ? (
            <Image
              src={currentPhotoURL}
              alt={currentName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              unoptimized={currentPhotoURL.startsWith('data:')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-light-600" />
            </div>
          )}
        </div>
        <p className="text-sm text-light-600 mt-2">Profile Photo</p>
      </div>

      {/* Profile Form */}
      <form id="profile-form" action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your display name"
            required
            className={`bg-dark-200 border-light-800 text-light-100 placeholder:text-light-600 ${
              validationErrors.displayName ? 'border-destructive-200 focus:border-destructive-200' : ''
            }`}
          />
          {validationErrors.displayName && (
            <div className="flex items-center gap-2 text-sm text-destructive-200">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.displayName}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            value={currentEmail}
            disabled
            className="bg-dark-300 border-light-800 text-light-600 cursor-not-allowed"
          />
          <p className="text-xs text-light-600">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <SubmitButton hasChanges={hasChanges} isValid={isValid} />
          
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full text-light-100 border-light-800 hover:bg-light-800/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Changes
            </Button>
          )}
        </div>
        
        {/* Change Indicator with Keyboard Shortcuts */}
        {hasChanges && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-primary-200 bg-primary-200/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              You have unsaved changes
            </div>
            <div className="text-xs text-light-600 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-light-800/20 rounded text-light-400">Ctrl+S</kbd> to save or <kbd className="px-1.5 py-0.5 bg-light-800/20 rounded text-light-400">Esc</kbd> to reset
            </div>
          </div>
        )}
        
        {state.errors?.displayName && (
          <p className="text-sm text-destructive-100">
            {state.errors.displayName[0]}
          </p>
        )}
      </form>
    </div>
  )
}
