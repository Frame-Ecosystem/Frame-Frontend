# Authentication System

The authentication system manages user identity, session lifecycle, OAuth integration, and route protection for the Frame Beauty platform.

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Browser"]
        AP[AuthProvider Context]
        TM[TokenManager]
        CS[CSRF Utilities]
        RH[Rate Limit Hook]
    end

    subgraph Components["Auth UI"]
        SID[SignInDialog]
        SUF[SignUpForm]
        SF[SignupFlow]
        GB[GoogleButton]
    end

    subgraph Guards["Route Protection"]
        AG[AuthGuard]
        ADG[AdminGuard]
        RA[useRequireAuth]
    end

    subgraph Backend["API Server"]
        AUTH_API["/v1/auth/*"]
        ME_API["/v1/me/*"]
    end

    Components --> AP
    AP -->|accessToken in memory| TM
    TM -->|proactive refresh| AUTH_API
    AP -->|HttpOnly cookie| AUTH_API
    AP -->|user profile| ME_API
    Guards -->|reads context| AP
    CS -->|X-CSRF-Token header| AUTH_API
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant SID as SignInDialog
    participant AS as AuthService
    participant API as /v1/auth
    participant AP as AuthProvider
    participant TM as TokenManager

    U->>SID: Enter email/phone + password
    SID->>AS: signIn(emailOrPhone, password)
    AS->>API: POST /v1/auth/login
    API-->>AS: { data: User, token, expiresIn }
    AS-->>SID: AuthTokenResponse
    SID->>AP: setAuth(user, token, expiresIn)
    AP->>TM: scheduleRefresh(expiresIn - 2min)
    AP->>AP: Store session flag in localStorage
    AP->>AP: Connect Socket.IO
    AP->>AP: Apply theme & language prefs
    TM-->>API: POST /v1/auth/refresh-token (before expiry)
    API-->>TM: { token, expiresIn }
```

---

## Signup Flow

```mermaid
stateDiagram-v2
    [*] --> ChooseType
    ChooseType --> FillForm: Select "Client" or "Lounge"
    FillForm --> WaitVerification: Submit signup
    WaitVerification --> Authenticated: Email verified (polled every 1s)
    WaitVerification --> FillForm: Retry with different email
    Authenticated --> [*]
```

---

## Google OAuth Flow

```mermaid
sequenceDiagram
    participant U as User
    participant GB as GoogleButton
    participant Popup as OAuth Popup
    participant API as /v1/auth/google
    participant AP as AuthProvider

    U->>GB: Click "Sign in with Google"
    GB->>Popup: openGoogleOAuthPopup(mode)
    Popup->>API: Redirect to Google consent
    API-->>Popup: /auth/google/done?token=...
    Popup->>AP: window.postMessage(VERIFICATION_COMPLETED)
    AP->>AP: setAuth(user, token)
```

---

## Token Lifecycle

```mermaid
graph LR
    A[Login / Refresh] -->|access token| B[Memory Only]
    A -->|refresh token| C[HttpOnly Cookie]
    A -->|session flag| D[localStorage: hasRefreshToken]
    B -->|attached to requests| E[API Client]
    C -->|sent automatically| F[POST /v1/auth/refresh-token]
    D -->|cross-tab sync| G[StorageEvent Listener]

    style B fill:#4ade80,stroke:#166534
    style C fill:#60a5fa,stroke:#1e40af
    style D fill:#fbbf24,stroke:#92400e
```

| Token         | Storage                        | Lifetime       | Purpose                  |
| ------------- | ------------------------------ | -------------- | ------------------------ |
| Access Token  | JavaScript variable (memory)   | 15 min (900s)  | API authorization        |
| Refresh Token | HttpOnly secure cookie         | Server-managed | Silent re-authentication |
| Session Flag  | localStorage `hasRefreshToken` | Until logout   | Cross-tab sync detection |

**Proactive Refresh**: `TokenManager` schedules refresh 2 minutes before access token expires, preventing API call failures.

---

## Directory Structure

```
app/_auth/                         (also mirrored at app/_systems/auth/)
├── auth-provider.tsx              AuthProvider context + useAuth hook
├── auth.service.ts                AuthService class (all API calls)
├── auth.types.ts                  Type definitions & constants
├── index.ts                       Barrel exports
├── components/
│   ├── sign-in-dialog.tsx         Login form (email/phone + password)
│   ├── sign-up-form.tsx           Registration form with validation
│   ├── signup-flow.tsx            3-step signup state machine
│   ├── google-button.tsx          OAuth button with Google SVG
│   └── email-verification.tsx     Deprecated (returns null)
├── guards/
│   ├── auth-guard.tsx             General route protection
│   └── admin-guard.tsx            Admin-only route protection
├── hooks/
│   ├── use-password-rules.ts      Password policy evaluator
│   ├── use-rate-limit.ts          Client-side rate limiter
│   └── use-require-auth.ts        Page-level auth guard hook
└── lib/
    ├── csrf.ts                    CSRF token extraction
    ├── error-mapper.ts            Error response → user message
    ├── google-popup.ts            Google OAuth popup handler
    ├── signup-validators.ts       Signup field validation
    └── token-manager.ts           Proactive token refresh scheduler
```

---

## Type Definitions

```mermaid
classDiagram
    class AuthContextType {
        +User | null user
        +string | null accessToken
        +boolean isLoading
        +setAuth(user, token, expiresIn)
        +clearAuth()
        +refreshUser()
    }

    class User {
        +string _id
        +string email
        +string phoneNumber
        +string firstName
        +string lastName
        +string loungeTitle
        +string bio
        +UserType type
        +Gender gender
        +boolean emailVerified
        +string theme
        +string language
    }

    class AuthTokenResponse {
        +User data
        +string token
        +number expiresIn
        +string message
    }

    class SignupDto {
        +string email
        +string password
        +string phoneNumber
        +Gender gender
        +string firstName
        +string lastName
        +string LoungeTitle
        +UserType type
        +object location
    }

    class AuthApiError {
        +number status
        +string message
        +string code
        +number retryAfter
    }

    AuthContextType --> User
    AuthTokenResponse --> User
```

---

## API Endpoints

```mermaid
graph LR
    subgraph Auth["/v1/auth"]
        L[POST /login]
        S[POST /signup]
        R[POST /refresh-token]
        LO[POST /logout]
        LA[POST /logout-all]
        FP[POST /forgot-password]
        RP[POST /reset-password]
    end

    subgraph Profile["/v1/me"]
        GU[GET /]
        PI[PUT /image]
        CI[PUT /cover-image]
        UL[PUT /location]
        UC[PUT /client]
        UT[PUT /theme]
        ULang[PUT /language]
        CP[POST /change-password]
        SV[POST /send-verification-code]
        VE[POST /verify-email]
    end
```

---

## Auth Error Codes

| Code                  | Description                     |
| --------------------- | ------------------------------- |
| `INVALID_CREDENTIALS` | Wrong email/phone or password   |
| `ACCOUNT_LOCKED`      | Too many failed attempts        |
| `ACCOUNT_BLOCKED`     | Suspended by admin              |
| `TOKEN_EXPIRED`       | Access token past expiry        |
| `TOKEN_REUSE`         | Refresh token replay detected   |
| `EMAIL_EXISTS`        | Email already registered        |
| `PHONE_EXISTS`        | Phone number already registered |
| `DISPOSABLE_EMAIL`    | Temporary email service blocked |
| `RATE_LIMIT_EXCEEDED` | Too many requests (429)         |

---

## Password Policy

| Rule              | Requirement             |
| ----------------- | ----------------------- |
| Minimum length    | 8 characters            |
| Maximum length    | 128 characters          |
| Uppercase         | At least 1 A-Z          |
| Lowercase         | At least 1 a-z          |
| Digit             | At least 1 0-9          |
| Special character | At least 1 of `@$!%*?&` |

---

## Rate Limiting

The `useAuthRateLimit` hook enforces client-side rate limiting on auth forms:

| Parameter         | Value                                   |
| ----------------- | --------------------------------------- |
| Failure threshold | 5 consecutive failures                  |
| Initial cooldown  | 30 seconds                              |
| Max cooldown      | 120 seconds                             |
| Escalation        | Doubles each time threshold is exceeded |

---

## Route Protection

```mermaid
flowchart TD
    REQ[Page Request] --> LOAD{AuthProvider loading?}
    LOAD -->|Yes| NULL[Render nothing]
    LOAD -->|No| PUB{Is public route?}
    PUB -->|Yes| RENDER[Render page]
    PUB -->|No| AUTH{User authenticated?}
    AUTH -->|Yes| ADMIN{Is admin route?}
    AUTH -->|No| REDIRECT["Redirect → /?signin=true"]
    ADMIN -->|No| RENDER
    ADMIN -->|Yes| TYPE{user.type === admin?}
    TYPE -->|Yes| RENDER
    TYPE -->|No| REDIRECT
```

**Public Routes** (no auth required):
`/`, `/auth/google/callback`, `/auth/google/done`, `/auth/google/error`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify`, `/auth/check-email`

---

## Cross-Tab Synchronization

When a user logs in or out in one tab, all other tabs detect the change via `StorageEvent` on the `hasRefreshToken` localStorage key:

```mermaid
sequenceDiagram
    participant Tab1 as Tab 1
    participant LS as localStorage
    participant Tab2 as Tab 2

    Tab1->>LS: Set hasRefreshToken = "1"
    LS-->>Tab2: StorageEvent fired
    Tab2->>Tab2: Call refreshToken()
    Tab2->>Tab2: Restore session from cookie

    Tab1->>LS: Remove hasRefreshToken
    LS-->>Tab2: StorageEvent fired
    Tab2->>Tab2: clearAuth()
```

---

## Phone Number Handling

All phone inputs are formatted for Tunisia:

- Input: 8 digits (e.g., `12345678`)
- Stored: `+21612345678` (Tunisia country code `+216`)
- Detection: `isPhoneInput()` checks if input is all digits
