// Shared / common types

// HTTP method type used across CSRF utilities
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string

// UI prop types (centralized so other modules can reference them)
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
