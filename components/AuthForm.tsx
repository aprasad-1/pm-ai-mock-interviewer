'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signUp, signIn } from '@/lib/actions/auth.action'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Dynamic schema based on form type
const createAuthSchema = (type: 'sign-in' | 'sign-up') => {
  const baseSchema = {
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }

  if (type === 'sign-up') {
    return z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      ...baseSchema,
    })
  }

  return z.object(baseSchema)
}

interface AuthFormProps {
  type: 'sign-in' | 'sign-up'
}

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter()
  const schema = createAuthSchema(type)
  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: type === 'sign-up' 
      ? { name: '', email: '', password: '' } as FormData
      : { email: '', password: '' } as FormData,
  })

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      // Get ID token and create session cookie via server action
      const idToken = await userCredential.user.getIdToken()
      
      // Check if this is a new user and save to Firestore if needed
      if (userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime) {
        // New user - save to Firestore
        await signUp({
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || 'Google User',
          email: userCredential.user.email!,
          photoURL: userCredential.user.photoURL || undefined,
        })
      }
      
      const signInResult = await signIn({
        email: userCredential.user.email!,
        idToken,
        photoURL: userCredential.user.photoURL || undefined,
      })
      
      console.log('✅ Google sign in result:', signInResult)
      toast.success('Signed in with Google successfully!')
      
      // Small delay to ensure session cookie is set, then force refresh
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error: unknown) {
      console.error('Google sign-in error:', error)
      
      let errorMessage = 'Failed to sign in with Google.'
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.'
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.'
      }
      
      toast.error(errorMessage)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (type === 'sign-up') {
        // Sign up with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          data.email, 
          data.password
        )
        
        // Save user data to Firestore via server action
        await signUp({
          uid: userCredential.user.uid,
          name: (data as { name: string; email: string; password: string }).name,
          email: data.email,
          photoURL: userCredential.user.photoURL || undefined,
        })
        
        toast.success('Account created successfully!')
        router.push('/')
      } else {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          data.email, 
          data.password
        )
        
        // Get ID token and create session cookie via server action
        const idToken = await userCredential.user.getIdToken()
        const result = await signIn({
          email: data.email,
          idToken,
        })
        
        console.log('✅ Sign in result:', result)
        toast.success('Signed in successfully!')
        
        // Small delay to ensure session cookie is set, then force refresh
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error)
      
      // Handle Firebase Auth errors
      let errorMessage = 'An error occurred. Please try again.'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = error.code as string;
        if (errorCode === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists.'
        } else if (errorCode === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters.'
        } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
          errorMessage = 'Invalid email or password.'
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.'
        }
      }
      
      toast.error(errorMessage)
    }
  }

  const isSignUp = type === 'sign-up'

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="!bg-transparent !border-0" style={{ background: 'transparent !important' }}>
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-light-100">
              {isSignUp 
                ? 'Sign up to start your interview preparation' 
                : 'Sign in to continue your preparation'
              }
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="form space-y-4">
              {/* {isSignUp && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          className="input"
                          placeholder="Enter your full name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )} */}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label">Email</FormLabel>
                    <FormControl>
                      <Input 
                        className="input"
                        type="email"
                        placeholder="Enter your email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="label">Password</FormLabel>
                    <FormControl>
                      <Input 
                        className="input"
                        type="password"
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="btn w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting 
                  ? 'Loading...' 
                  : isSignUp 
                    ? 'Create Account' 
                    : 'Sign In'
                }
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-light-100">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={form.formState.isSubmitting}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-light-100">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link 
                href={isSignUp ? '/sign-in' : '/sign-up'}
                className="text-primary-200 hover:text-primary-100 font-semibold"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
