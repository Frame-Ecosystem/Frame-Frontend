"use client"

import { useEffect, useState } from "react"

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Please wait...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // If this page was opened in a popup by the parent, just signal success and close
        if (window.opener && !window.opener.closed) {
          // Backend has already set the refresh token cookie
          // Parent window polling will handle the rest
          setStatus('success')
          setMessage('Authentication successful! Closing...')
          setTimeout(() => {
            window.close()
          }, 500)
          return
        }

        // If opened directly (not in popup), this means backend redirected here after OAuth
        // Check if we can detect the parent window or if this is a standalone page
        setMessage('Finalizing authentication...')
        
        // Try to close after a short delay (in case it's a popup we couldn't detect)
        setTimeout(() => {
          try {
            window.close()
            // If close didn't work, we're in a regular tab
            setTimeout(() => {
              setStatus('error')
              setMessage('Please close this window and return to the main app.')
            }, 500)
          } catch {
            setStatus('error')
            setMessage('Please close this window and return to the main app.')
          }
        }, 1000)
      } catch {
        setStatus('error')
        setMessage('Please close this window and return to the main app.')
      }
    }

    handleCallback()
  }, [])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-card border rounded-lg p-6">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-semibold mb-2 text-lg">Authentication Complete</h2>
            <p className="text-muted-foreground text-sm mb-4">{message}</p>
            <button
              onClick={() => window.close()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="font-semibold mb-2">{status === 'success' ? 'Success!' : 'Completing Sign In'}</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
}