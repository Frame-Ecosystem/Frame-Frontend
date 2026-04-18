# Auth Module — Authentication & Session Management

> **Base URL:** `/v1/auth`  
> **Auth:** Most endpoints are public (signup, login, etc.). Logout/session endpoints require JWT.  
> **CSRF:** Web clients receive CSRF token on login; mobile clients (`X-Client-Type: mobile`) are exempt.

## Architecture

```
src/
├── controllers/auth/
│   └── auth.controller.ts              # Request handling, cookie management, device extraction
├── services/auth/
│   ├── auth.service.ts                 # Facade — signup, login, magic-link verification
│   ├── authToken.service.ts            # JWT creation, refresh token rotation, password reset
│   └── authSession.service.ts          # Session tracking, logout, OAuth token generation
├── routes/auth/
│   └── auth.route.ts                   # Route definitions with rate limiters & validation
├── dtos/auth/
│   └── auth.dto.ts                     # Request validation DTOs
├── interfaces/auth/
│   └── auth.interface.ts               # TypeScript interfaces (TokenData, RequestWithUser, etc.)
├── models/auth/
│   └── verificationToken.model.ts      # MongoDB model for magic-link & password-reset tokens
├── middlewares/
│   ├── auth.middleware.ts              # JWT verification middleware (guards protected routes)
│   ├── csrf.middleware.ts              # Double-submit cookie CSRF protection
│   └── rate-limit.middleware.ts        # Per-endpoint rate limiters
└── config/
    ├── passport.ts                     # Google OAuth 2.0 strategy (Passport.js)
    ├── index.ts                        # Environment variables (SECRET_KEY, REFRESH_TOKEN_SECRET, etc.)
    └── constants.ts                    # Token expiry, bcrypt rounds, rate limit windows
```

### Service Responsibilities

| Service | Purpose |
|---------|---------|
| `AuthService` | High-level facade. Orchestrates signup (magic-link), login, and delegates to token/session services. |
| `AuthTokenService` | JWT access token creation, refresh token generation with bcrypt hashing, token rotation with reuse detection, forgot/reset password flows. |
| `AuthSessionService` | Session lifecycle (logout single/all), device tracking derived from refresh tokens, OAuth user token generation, `sessionTrack` sync. |

---

## API Endpoints

### Registration — Magic Link Flow

| Method | Path | Body/Params | Rate Limit | Description |
|--------|------|-------------|------------|-------------|
| `POST` | `/signup` | `CreateUserDto` | 3/hour | Sends magic-link verification email |
| `GET` | `/verify` | `?token=<uuid>` | 100/15min | Verifies magic link, creates user, returns tokens |

#### Signup Flow
1. Client sends `POST /signup` with user data
2. Server validates, hashes password, creates `VerificationToken` (10min TTL)
3. Server sends magic-link email: `{FRONTEND_BASE_URL}/auth/verify?token={uuid}`
4. User clicks link → frontend calls `GET /verify?token={uuid}`
5. Server creates user account, returns access + refresh tokens

#### CreateUserDto (Signup)
```typescript
{
  email?: string;          // valid email, normalized to lowercase
  password: string;        // required, min 8 chars, must contain: uppercase, lowercase, digit, special char
  phoneNumber?: string;    // optional, 8-digit format
  gender?: 'male' | 'female' | 'unisex' | 'kids';
  firstName?: string;      // max 50 chars
  lastName?: string;       // max 50 chars
  LoungeTitle?: string;    // max 100 chars
  type?: 'user' | 'client' | 'lounge';   // determines user role
  location?: { lat: number; lng: number; placeId?: string; address?: string };
  profileImage?: string;   // valid URL
}
```

#### Signup Response
```json
{
  "message": "Verification email sent. Please check your email and click the link to complete registration.",
  "success": true
}
```

#### Verify Response (Web)
```json
{
  "data": { "_id": "...", "email": "...", "type": "client", ... },
  "token": "<access_token>",
  "expiresIn": 900,
  "message": "verification_successful"
}
```
+ `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
+ `Set-Cookie: csrf-token=<token>; SameSite=Strict; Path=/; Max-Age=86400`

#### Verify Response (Mobile — `X-Client-Type: mobile`)
```json
{
  "data": { "_id": "...", "email": "...", "type": "client", ... },
  "accessToken": "<access_token>",
  "refreshToken": "<refresh_token>",
  "expiresIn": 900,
  "message": "verification_successful"
}
```

---

### Login

| Method | Path | Body | Rate Limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `/login` | `LoginUserDto` | 5/15min | Authenticate with email/phone + password |

#### LoginUserDto
```typescript
{
  emailOrPhone: string;    // required — email address OR phone number
  password: string;        // required
}
```

#### Login Response (Web)
```json
{
  "data": { "_id": "...", "email": "...", "type": "client", ... },
  "token": "<access_token>",
  "expiresIn": 900,
  "message": "login"
}
```
+ `Set-Cookie: refreshToken=...` (HttpOnly)
+ `Set-Cookie: csrf-token=...` (JS-readable)

#### Login Response (Mobile)
```json
{
  "data": { "_id": "...", "email": "...", ... },
  "accessToken": "<access_token>",
  "refreshToken": "<refresh_token>",
  "expiresIn": 900,
  "message": "login"
}
```

#### Account Lockout
After **5 consecutive failed attempts**, the account is locked for **15 minutes**:
```json
{
  "status": 401,
  "message": "Account temporarily locked. Try again in 12 minutes.",
  "code": "ACCOUNT_LOCKED"
}
```

#### Blocked Account
```json
{
  "status": 403,
  "message": "Account suspended. Please contact support.",
  "code": "ACCOUNT_BLOCKED"
}
```

---

### Token Refresh

| Method | Path | Body | Rate Limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `/refresh-token` | — (web) / `{ refreshToken }` (mobile) | — | Rotate refresh token, get new access token |

**Web:** Refresh token is read from `refreshToken` HttpOnly cookie.  
**Mobile:** Refresh token is sent in request body.

#### Refresh Response (Web)
```json
{
  "token": "<new_access_token>",
  "expiresIn": 900,
  "message": "Token refreshed"
}
```
+ New `Set-Cookie: refreshToken=...` (rotated)

#### Refresh Response (Mobile)
```json
{
  "token": "<new_access_token>",
  "refreshToken": "<new_refresh_token>",
  "expiresIn": 900,
  "message": "Token refreshed"
}
```

#### Token Reuse Detection
If a refresh token that was already rotated is reused (possible theft), **all sessions are revoked**:
```json
{
  "status": 401,
  "message": "Security alert: Please login again",
  "code": "TOKEN_REUSE"
}
```

---

### Logout

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/logout` | JWT required | Logout current device (revoke refresh token by `jti`) |
| `POST` | `/logout-all` | JWT required | Revoke all sessions across all devices |

#### Logout Response
```json
{
  "data": { "_id": "...", "email": "...", ... },
  "message": "logout"
}
```
+ `Clear-Cookie: refreshToken`
+ `Clear-Cookie: csrf-token`

#### Logout All Response
```json
{
  "message": "Logged out from all devices"
}
```

---

### Password Recovery

| Method | Path | Body | Rate Limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `/forgot-password` | `ForgotPasswordDto` | 3/15min | Send password reset email |
| `POST` | `/reset-password` | `ResetPasswordDto` | — | Reset password using token |

#### ForgotPasswordDto
```typescript
{
  email: string;   // required, valid email
}
```

#### ResetPasswordDto
```typescript
{
  token: string;       // required, UUID from email link
  newPassword: string; // required, min 8 chars, must match password policy
}
```

**Password policy:** Min 8 chars, at least one uppercase, one lowercase, one digit, one special character (`@$!%*?&`). Max 128 chars.

#### Forgot Password Response
```json
{
  "message": "Password reset link sent to your email"
}
```
> **Note:** Always returns 200 even if email doesn't exist (prevents user enumeration).

#### Reset Password Response
```json
{
  "message": "Password reset successfully"
}
```
> **Side effect:** All existing sessions are revoked, `passwordChangedAt` is updated (invalidates all existing access tokens).

---

### Google OAuth 2.0

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| `GET` | `/google/login` | — | Initiate Google OAuth for existing users |
| `GET` | `/google/signup` | `?type=client\|lounge` | Initiate Google OAuth for new users |
| `GET` | `/google/callback` | (handled by Passport) | OAuth callback — redirects or returns tokens |

#### Google OAuth Flow (Web)
1. Frontend redirects to `GET /v1/auth/google/login` (or `/google/signup?type=client`)
2. Server redirects to Google consent screen
3. Google redirects back to `/v1/auth/google/callback`
4. Server creates/finds user, sets cookies, redirects to:
   - **Success:** `{FRONTEND_BASE_URL}/auth/google/callback?status=success&provider=google`
   - **Error:** `{FRONTEND_BASE_URL}/auth/google/callback?status=error&error=<code>`

#### Google OAuth Error Codes
| Code | Meaning |
|------|---------|
| `account_exists` | Trying to signup with Google but account already exists |
| `account_blocked` | Account is suspended |
| `account_not_found` | Trying to login with Google but no account exists |
| `oauth_failed` | General OAuth failure |

#### Google OAuth Flow (Mobile)
Mobile clients receive tokens in the response body instead of cookies (same as login response format).

---

## Token Architecture

### Access Token (JWT)
- **Storage:** In-memory (JavaScript variable) — never in localStorage/cookies
- **Expiry:** 15 minutes (configurable via `ACCESS_TOKEN_EXPIRES_SECONDS`)
- **Header:** `Authorization: Bearer <token>`
- **Payload:** `{ _id: string, iat: number, exp: number }`

### Refresh Token (JWT)
- **Storage (Web):** HttpOnly secure cookie (`refreshToken`)
- **Storage (Mobile):** Returned in response body, stored securely on device
- **Expiry:** 7 days (configurable via `REFRESH_TOKEN_EXPIRES_SECONDS`)
- **Payload:** `{ _id: string, jti: string }` — `jti` is UUID for rotation tracking
- **Server-side:** bcrypt hash stored in user's `refreshTokens[]` array

### Session Limits
- **Max sessions per user:** 5 (configurable via `MAX_SESSIONS_PER_USER`)
- When limit is reached, the oldest session is evicted (FIFO)
- Each session tracked by `jti`, `deviceName`, `ip`, `userAgent`, `createdAt`, `expiresAt`

### CSRF Token
- **Cookie:** `csrf-token` (non-HttpOnly, JS-readable)
- **Header:** `X-CSRF-Token`
- **Pattern:** Double-submit cookie — client reads cookie, sends value in header
- **Scope:** Required on state-changing requests (POST/PUT/PATCH/DELETE) for web clients
- **Bypass:** Mobile clients (`X-Client-Type: mobile`) are exempt
- **Dev bypass:** Send `dev-bypass` as token value in development mode

---

## Error Response Format

```json
{
  "status": 401,
  "message": "Human-readable error description",
  "code": "ERROR_CODE"
}
```

### Auth Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `INVALID_CREDENTIALS` | 401 | Wrong email/phone or password |
| `ACCOUNT_LOCKED` | 401 | Too many failed attempts, temporarily locked |
| `ACCOUNT_BLOCKED` | 403 | Account suspended by admin |
| `INVALID_TOKEN` | 401 | JWT invalid, expired, or tampered |
| `TOKEN_EXPIRED` | 401 | Refresh token expired |
| `TOKEN_REUSE` | 401 | Refresh token reused after rotation (all sessions revoked) |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `PHONE_EXISTS` | 409 | Phone number already registered |
| `EMAIL_REQUIRED` | 400 | Signup without email |
| `DISPOSABLE_EMAIL` | 400 | Disposable/temporary email rejected |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Request Headers

### Required for all protected endpoints
```
Authorization: Bearer <access_token>
```

### Required for state-changing requests (web clients only)
```
X-CSRF-Token: <csrf_token_from_cookie>
```

### Mobile client identification
```
X-Client-Type: mobile
```

### Optional — device tracking
```
User-Agent: <browser_or_app_user_agent>
```
Body field `deviceName` can be sent during login/signup for custom device naming.

---

## Rate Limits

| Endpoint | Window | Max Requests | Purpose |
|----------|--------|-------------|---------|
| `POST /signup` | 1 hour | 3 | Spam prevention |
| `POST /login` | 15 min | 5 | Brute-force prevention |
| `POST /forgot-password` | 15 min | 3 | Email flood prevention |
| `GET /verify` | 15 min | 100 | General rate limit |
| `POST /refresh-token` | 15 min | 10 | Token refresh abuse |

---

## Security Features

1. **Timing-attack prevention:** Failed login on non-existent user still runs bcrypt compare against dummy hash
2. **Account lockout:** 5 failed attempts → 15min lock (configurable)
3. **Refresh token rotation:** Every refresh invalidates the old token and issues a new one
4. **Reuse detection:** If a rotated token is reused, all sessions are immediately revoked (theft protection)
5. **Password-change invalidation:** Access tokens issued before `passwordChangedAt` are rejected
6. **Blocked account protection:** Blocked users cannot login, refresh tokens, or access protected routes
7. **Disposable email rejection:** Temporary/disposable email providers are blocked at signup
8. **Security event logging:** All auth events (login, logout, token refresh, failures) logged with IP/device info

---

## Notes for Frontend Implementation

1. **Token storage:** Store access token in memory (JavaScript variable), NOT in localStorage or cookies. It expires in 15 minutes.
2. **Auto-refresh:** Set up an interceptor to call `POST /refresh-token` when access token expires (401 response). The refresh token cookie is sent automatically by the browser.
3. **Mobile token handling:** Mobile apps receive both tokens in the response body. Store the refresh token securely (Keychain/Keystore).
4. **CSRF setup:** After login, read the `csrf-token` cookie and include its value in `X-CSRF-Token` header for all mutation requests.
5. **Logout behavior:** `POST /logout` revokes only the current device. `POST /logout-all` revokes everything.
6. **Google OAuth redirect:** After Google OAuth callback redirect, check the URL params (`status`, `error`) to determine success/failure.
7. **Password reset flow:** `POST /forgot-password` → user gets email → clicks link → frontend extracts token from URL → `POST /reset-password` with token + new password.
8. **Error handling:** Check `code` field in error responses for programmatic handling (e.g., show "Account locked" UI for `ACCOUNT_LOCKED`).
9. **Rate limit handling:** On 429 responses, read `retryAfter` from response body and show appropriate UI.
10. **Sensitive fields stripped:** User responses never include `password`, `refreshTokens`, or other sensitive fields.
11. **Device name:** Send `deviceName` in login/signup body for better session management UX (e.g., "John's iPhone").
