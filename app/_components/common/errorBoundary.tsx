"use client"
import React from "react"
import { reportError } from "@/app/_lib/report-error"

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
    reportError(error, {
      source: "error-boundary",
      componentStack: errorInfo.componentStack,
    })
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
