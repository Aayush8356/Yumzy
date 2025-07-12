'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again later.')
    }
  }

  const resendVerification = async () => {
    if (!token) return

    setResendLoading(true)
    try {
      // Extract email from token or ask user to provide email
      // For now, we'll show a message directing to login page
      setMessage('Please log in to resend verification email.')
    } catch (error) {
      setMessage('Failed to resend verification email.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍕 Yumzy
          </h1>
          <p className="text-gray-600 mb-8">Delicious Food Delivered</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Verified Successfully! 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition duration-200 inline-block text-center font-medium"
                  >
                    Continue to Login
                  </Link>
                  <Link
                    href="/menu"
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 inline-block text-center font-medium"
                  >
                    Browse Menu
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="rounded-full bg-red-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={resendVerification}
                    disabled={resendLoading}
                    className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification'}
                  </button>
                  <Link
                    href="/login"
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 inline-block text-center font-medium"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>

          {status !== 'loading' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p>
                  Need help?{' '}
                  <Link href="/contact" className="text-rose-600 hover:text-rose-700">
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}