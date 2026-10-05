# Authentication system review

**Focus:** session restoration and the browser-side multi-session/account-switching flow.
**Review type:** source review with follow-up implementation status. Historical session-manager findings refer to the removed implementation. This is an engineering review, not a penetration test.

## Executive summary

The restore path avoids unnecessary network calls after explicit logout or when there is no session marker, refreshes credentials with the server, and now requires a current-user response before publishing authenticated state. Restore requests share an abortable five-second deadline, including CSRF bootstrap if needed; transient restore failures retain the non-sensitive session hint for retry. Root-route bootstrap checks a remembered session and shows the animated brand loader while checking; signed-in users are redirected to `/home`.

The retired local “multiple accounts” feature was not a reliable implementation of independently restorable accounts. It stored user profiles and metadata in localStorage, while the provider tried to choose a server session by user ID. The backend does implement session-list and session-switch endpoints, but these represent sessions belonging to the authenticated user (for example, that user's browsers/devices); they are not a mechanism for switching to a different account whose profile was saved locally. The old local records contained neither independent credentials nor server session IDs.

The same-browser saved-account picker and storage have been removed. Normal login in separate browsers remains backed by independent server-managed refresh-token sessions; the backend defaults to a maximum of five per account (configurable).

## What is good

- **Local-first guards:** `restoreSession` exits before making a request after manual logout or when there is no session marker. This avoids needless refresh traffic and prevents an ordinary reload from undoing an explicit logout.
- **Server-backed credential renewal:** restoration refreshes credentials and then asks the server for the current user, instead of treating a cached profile as proof that the session remains valid.
- **Bounded waiting:** the restore operation has a hard timeout, which is a useful UX safeguard against an indefinitely blocked startup screen.
- **Explicit logout intent:** logout clears auth state and records a manual-logout marker, so “no session” and “the user explicitly logged out” are not conflated.
- **Reasonable authentication side effects:** successful restore applies user preferences and initializes the socket after user data is available.

## What is bad / should be fixed

### P0 — A timed-out restore could still authenticate later (fixed)

`auth-provider.tsx` wraps an async refresh-then-profile sequence in `withTimeout`. When the timeout wins, the outer catch clears the token and returns `false`, but the underlying sequence is not cancelled. If either request later completes, it can still call `tokenManager.set`, `setAccessToken`, and `setUser`; the restore that was reported as failed can consequently resurrect authentication after the caller has moved on.

**Status:** fixed. The restore timeout aborts refresh/profile requests. Auth state is committed only after both succeed; logout, explicit login, and newer restore attempts abort older work without allowing its failure handler to clear newer credentials.

### P0 — Restore could report success without restoring a user (fixed)

After a valid refresh response, the provider sets the token and access-token getter. It then calls `getCurrentUser()`, but only updates `user` if the result is truthy; it returns `{ ok: true }` either way. A missing/failed profile result can therefore leave a token installed while `restoreSession()` reports success and the auth context has no restored user.

**Status:** fixed. An absent profile response fails restoration; success is returned only after token and user are both available.

### P1 — Restore failures are difficult to diagnose

Refresh failures, network failures, and timeouts collapse into `false`; exceptions are swallowed and production has no useful diagnostic signal in this path. Invalid refresh responses clear the session hint, while transient failures retain it for retry.

**Fix:** centralize failure cleanup and return/log a small typed failure reason (for example: no session, expired/invalid refresh, profile unavailable, timeout, network error). Avoid logging credentials or sensitive response bodies. Ensure token, user, CSRF state, API getter, and socket state are made consistent for each terminal outcome.

### P1 — The timeout may be too aggressive for real networks

The sequential CSRF bootstrap (when needed), refresh, and profile requests use a five-second end-to-end deadline. A fixed deadline can still fail on a degraded network, but it is abortable and transient failures preserve the session hint so a later retry does not require another sign-in.

**Fix:** measure restore latency and choose a realistic budget; consider one end-to-end deadline with cancellation, plus a deliberate loading/retry path rather than converting every slow response into a logged-out state.

### P1 — Stored “sessions” were not independently restorable

`sessions-manager.ts` stored a `User`, timestamps, a device label, and an active flag in localStorage. It did not store a distinct credential or server session identifier. The provider's `loadStoredSession` called `authService.listSessions()` and filtered server sessions by user ID. The backend route exists; the failure was conceptual, not a 404: sessions returned for the currently authenticated account cannot authenticate a different locally stored account.

**Status:** removed the browser-side profile/session cache, account picker, provider switch function, and unused frontend switch API wrappers. The existing backend device-session endpoints and independent browser logins are unchanged.

### P2 — Stored session data was trusted without shape validation (removed)

The removed `getAllSessions()` caught JSON parse errors, but returned parsed data as `StoredSession[]` without runtime validation. Callers dereferenced fields such as `s.user._id`; malformed, stale, or manually edited localStorage could therefore break session operations.

**Status:** the reader and account-picker flow have been removed. The auth provider deletes the legacy `frame:sessions` key at startup and no longer reads or writes those profiles.

**Fix:** validate and version the persisted shape at the read boundary; discard or migrate invalid records deterministically. Keep the stored representation minimal.

### P2 — Storage failures are silently presented as success

Several writes/removals catch localStorage exceptions and ignore them. In particular, `saveSession` returns a session object even if persistence failed, and `setActiveSession` can return an in-memory “active” result that was not stored. Callers cannot distinguish persisted state from a failed best-effort write.

**Fix:** make persistence outcomes explicit, or remove persistence if it is not required for authentication. Never let failed metadata storage imply that an account switch or restore succeeded.

## What should not exist (in its current form)

- **A local “active session” flag standing in for authenticated state.** The removed local flag was not an authentication boundary; identity must come from valid server-issued credentials and a successful current-user response.
- **Client-side localStorage deletion represented as “logout from all devices.”** That local-only behavior has been removed. The settings flow instead uses the backend logout-all endpoint to revoke server-managed sessions.
- **Treating a client-generated device label as a trusted identity.** Device labels derived from user-agent strings are approximate display metadata, not unique or authenticated device identities.

## Overdevelopment: multiple accounts in one browser session

The old manager maintained IDs, an active marker, timestamps, a five-item cap, sorting, device labels, per-user deduplication, and session-switch helpers for cached user objects. Its generated IDs did not correspond to backend sessions and the profile snapshots did not provide independent expiry, revocation, or safe switching.

**Status:** removed. To sign in as another account in this browser, sign out first and then sign in; separate browsers continue to maintain their own independent login sessions.

## Follow-up work

1. **Improve restore diagnostics.** Restore failures still collapse into `false`; add safe, typed failure reasons so timeout, invalid refresh, and temporary network failure can be handled and measured separately.
2. **Add focused auth-restore tests.** Cover no-session and manual-logout fast paths, CSRF bootstrap, refresh/profile failures, timeout cancellation, and logout/new-login racing an in-flight restore.
3. **Keep account switching out of scope unless explicitly required.** Supporting multiple accounts in one browser needs an explicit backend contract for distinct account identities; existing device-session APIs are not that contract.

## Tests that should gate future auth changes

- No-session and manual-logout restores make no network request.
- Refresh rejection, malformed refresh response, `/me` failure, and `/me` returning no user all resolve as failures and leave no partial authenticated state.
- Slow CSRF bootstrap, refresh, and `/me` requests obey the shared timeout; timed-out work cannot restore the user or repopulate the token.
- Logout or a newer restore attempt invalidates all earlier in-flight work.
- Legacy local profile snapshots are removed during auth-provider startup and cannot influence authentication.
- Logging into the same account from multiple browsers creates independent server-managed sessions; logout-all continues to revoke sessions server-side.
