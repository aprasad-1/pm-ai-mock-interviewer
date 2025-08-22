'use client'

import React from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateUserProfile } from '@/lib/actions/user.action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ProfileFormProps {
  currentName: string
  currentEmail: string
}

const initialState = {
  message: '',
  errors: {} as Record<string, string[]>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  )
}

export default function ProfileForm({ currentName, currentEmail }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfile, initialState)

  React.useEffect(() => {
    if (state.message) {
      if (state.message.includes('successfully')) {
        toast.success(state.message)
      } else {
        toast.error(state.message)
      }
    }
  }, [state.message])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={currentName}
          placeholder="Enter your display name"
          required
          className="bg-dark-200 border-light-800 text-light-100 placeholder:text-light-600"
        />
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

      <SubmitButton />
      
      {state.errors?.displayName && (
        <p className="text-sm text-destructive-100">
          {state.errors.displayName[0]}
        </p>
      )}
    </form>
  )
}
