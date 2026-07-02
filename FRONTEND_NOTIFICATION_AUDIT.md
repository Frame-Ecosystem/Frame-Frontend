# Frontend Notification Audit — Push/Socket Receiving Wrong User's Notifications

> Investigate why push notifications and socket events intended for one user (client or lounge) are being received by both sessions.

---

## 1. Socket Connection & Room Joining

The backend emits notifications to **user-scoped rooms**: `notifications:{userId}`. Your socket must only join rooms belonging to the **currently logged-in user**.

### Audit Checklist

- [ ] **When does `socket.emit('join', ...)` fire?**
  - On login? On page load? Only once or on every reconnect?
  - Is it inside a React effect with the correct dependency array?

- [ ] **What userId is passed?**
  ```javascript
  // Find every place this runs:
  socket.emit('join', [`notifications:${currentUser._id}`]);
  socket.emit('join', [`bookings:client:${currentUser._id}`]);
  socket.emit('join', [`bookings:lounge:${currentUser._id}`]);
  ```
  - Is `currentUser._id` coming from the JWT payload, Redux/Zustand store, or localStorage?
  - Could it be stale (e.g., old user data persisting after logout/login)?

- [ ] **Are you joining rooms for BOTH client AND lounge?**
  - If the same browser was used to log in as a lounge and later as a client, do old socket subscriptions persist?
  - Is there a code path that joins `bookings:lounge:{id}` even when the current user is a client (or vice versa)?

- [ ] **Do you leave old rooms on logout / user switch?**
  ```javascript
  // Is this called before joining new rooms?
  socket.emit('leave', [
    `notifications:${previousUser._id}`,
    `bookings:client:${previousUser._id}`,
    `bookings:lounge:${previousUser._id}`,
  ]);
  ```
  - A disconnect/reconnect on logout/login should handle this, but verify.

---

## 2. Socket Event Listeners

The frontend listens for events like `notification:new`, `booking:created`, `booking:updated`.

- [ ] **Are listeners registered inside a component that renders for both user types?**
  - If a shared layout/context registers a listener for `notification:new`, it will fire regardless of which user is logged in.
  - Should you **filter by notification type or user role** before showing the notification?

- [ ] **Do listeners accumulate on re-mount?**
  - If `socket.on(...)` is called inside a `useEffect` without cleanup, listeners stack up, causing duplicate handling.

---

## 3. FCM Device Token Registration

If push notifications (FCM) are also going to the wrong device:

- [ ] **When is `POST /v1/notifications/device-token` called?**
  - Is the token registered with the correct userId?
  - Is the old token unregistered (`DELETE /v1/notifications/device-token`) on logout?

- [ ] **Is the FCM token stored per-device or shared across sessions?**
  - A single device should only register one token for the currently logged-in user.
  - On logout → unregister. On login → register fresh.

---

## 4. Reproduction Steps to Test

1. Open **two browser tabs** (or browsers). Log in as **lounge** in one, **client** in the other.
2. Perform actions that trigger notifications:
   - Client creates a booking → only lounge should get `booking:created` push
   - Lounge confirms a booking → only client should get `booking:confirmed` push
   - Lounge adds a walk-in to queue → only client should get `queue:in-service` push
3. Check whether notifications appear on the **wrong screen** in either tab.

---

## 5. Likely Culprits (in order of probability)

| # | Issue | Where |
|---|-------|-------|
| 1 | Socket joins rooms for wrong/stale `userId` | Frontend room join logic |
| 2 | Old rooms not left on user switch | Logout/login flow |
| 3 | Socket listener registered in shared component, not scoped to role | Notification UI component |
| 4 | FCM token not cleared on logout | Auth/device token flow |
| 5 | Backend emitting to wrong room | Only if steps 1-4 checked out |

---

## 6. Network / Dev Tools Verification

- Add a `socket.io` event logger in the frontend:
  ```javascript
  socket.onAny((event, ...args) => {
    console.log(`[Socket] ${event}`, args);
  });
  ```
- Check the **room join payloads** — are the correct userIds being sent?
- Check the **received events** — do they contain a `data.userId` that doesn't match the logged-in user?

---

## 7. Deliverables

After investigation, report back:

1. ✅ Which `socket.emit('join', ...)` calls are active and with what userIds
2. ✅ Whether old rooms are left on logout
3. ✅ Whether socket listeners are duplicated or role-unaware
4. ✅ Whether FCM token registration/unregistration is correct
5. ✅ Root cause identified (file path + line number)
6. ✅ Fix recommendation
