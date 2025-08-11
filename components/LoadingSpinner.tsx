import React from 'react'

const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-200"></div>
      <p className="text-light-100 mt-4">{message}</p>
    </div>
  )
}

export default LoadingSpinner
