'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function QuickActionButtons() {
  const router = useRouter()

  return (
    <Card className="bg-dark-200 border-light-800">
      <CardHeader>
        <CardTitle className="text-light-100">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button 
            onClick={() => router.push('/interview')}
            className="bg-primary-200 text-dark-100 hover:bg-primary-100"
          >
            Go to Interview
          </Button>
          <Button 
            onClick={() => router.push('/profile')}
            variant="outline"
            className="border-light-800 text-light-100 hover:bg-light-800/10"
          >
            Go to Profile
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-light-800 text-light-100 hover:bg-light-800/10"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
