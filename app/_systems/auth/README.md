# Auth System

Full authentication lifecycle — login, signup (magic-link), token management, Google OAuth, password reset, guards, and CSRF protection.

## Architecture

```
types → service → auth-provider (context) → guards → hooks → components
```

## Modules

| Module              | Description                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `auth.types.ts`     | DTOs, response types, error codes, password policy                                                            |
| `auth.service.ts`   | `AuthService` — signIn, signUp, refreshToken, signOut, Google OAuth, magic-link verification, profile updates |
| `auth-provider.tsx` | React context managing user state, in-memory tokens, refresh rotation, cross-tab sync                         |

## Hooks

| Hook                 | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `useAuth`            | Main auth hook — user, isAuthenticated, login, logout (from context) |
| `use-require-auth`   | Redirects unauthenticated users to login                             |
| `use-rate-limit`     | Rate limiting for auth operations                                    |
| `use-password-rules` | Password validation rules and strength evaluator                     |

## Components

| Component            | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `sign-in-dialog`     | Login modal with email/password and Google OAuth |
| `sign-up-form`       | Registration form                                |
| `signup-flow`        | Multi-step signup wizard                         |
| `google-button`      | Google OAuth trigger button                      |
| `email-verification` | Magic-link verification UI                       |

## Guards

| Guard         | Purpose                               |
| ------------- | ------------------------------------- |
| `auth-guard`  | Wraps routes requiring authentication |
| `admin-guard` | Wraps routes requiring admin role     |

## Lib

| Utility                | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `csrf.ts`              | CSRF double-submit cookie handling                            |
| `error-mapper.ts`      | Backend error code → user-friendly message                    |
| `google-popup.ts`      | Google OAuth popup flow                                       |
| `signup-validators.ts` | Signup password validation                                    |
| `token-manager.ts`     | In-memory access token storage + proactive refresh scheduling |

## Security Model

- Access token stored in memory only (never localStorage)
- Refresh token in HttpOnly cookie
- CSRF double-submit cookie on state-changing requests
- Cross-tab sync via localStorage flag
- Proactive token refresh before expiry

## Dependencies

- `@/app/_services/api` — HTTP client
- `@/app/_services/socket` — Socket.IO disconnect on logout
- `@/app/_i18n` — Translation context
- `next-themes` — Theme preference on login
