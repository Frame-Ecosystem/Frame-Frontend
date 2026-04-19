"use client"
import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info here or send to a logging service
    void error
    void errorInfo
    if (process.env.NODE_ENV === "production") {
      // TODO: send error and errorInfo to a logging service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-destructive p-8 text-center">
            <h2 className="mb-2 text-xl font-bold">Something went wrong.</h2>
            <pre className="text-xs whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
        )
      )
    }
    return this.props.children
  }
}
