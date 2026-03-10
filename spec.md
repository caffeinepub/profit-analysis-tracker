# Profit Analysis Tracker

## Current State
The app uses Internet Identity (II) for authentication. The login page shows a single "Sign in with Internet Identity" button. After login, users set a display name via SetUsername page. The backend stores UserProfile with username, createdAt, lastLoginAt. Monthly history page shows cards per month with no export functionality.

## Requested Changes (Diff)

### Add
- Login page: professional email + password input fields; clicking Sign In triggers II auth then verifies email/password against stored profile
- Register page: username + email + create password + confirm password fields; after II auth, saves all fields to profile
- Email + passwordHash fields to UserProfile in backend
- `registerUserWithEmailPassword(username, email, passwordHash)` backend function
- `verifyEmailPassword(email, passwordHash)` backend query function
- Monthly history export: CSV download, PDF (print), DOC (HTML-to-Word) export buttons per month or for all months
- Switch between Login / Register on the auth page via tabs or toggle link

### Modify
- Login page: replace simple II button with professional two-panel form (Login / Register) with visible inputs styled like modern SaaS websites
- SetUsername page: no longer needed after registration form is introduced (replaced by Register page flow)
- Backend `registerUser` -> replaced/augmented with email+password registration
- MonthlyHistory page: add export toolbar with PDF/DOC/CSV buttons

### Remove
- Separate SetUsername page (registration form covers this)

## Implementation Plan
1. Update backend: add email + passwordHash to UserProfile, add registerUserWithEmailPassword, add verifyEmailPassword query
2. Update backend.d.ts to reflect new functions and UserProfile fields
3. Redesign Login/Register page as a single auth page with tab toggle (Sign In / Register), professional UI with visible inputs
4. Update App.tsx auth flow: after II login check for profile, redirect to register tab if no profile exists
5. Remove/replace SetUsername page with the new Register flow
6. Update useQueries hooks for new backend functions  
7. Add export functionality to MonthlyHistory: CSV (client-side), PDF (window.print with print styles), DOC (HTML blob download)
