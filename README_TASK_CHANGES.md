# Milestone-2 Task Change Log

Date: 2026-03-10

This file records the task changes integrated into the milestone-2 project.

## Files Updated

1. backend/src/main/java/com/fixitnow/backend/config/SecurityConfig.java

- Added public access rule for `/error` endpoint.
- Change: `.requestMatchers("/error").permitAll()`.
- Purpose: Avoid security blocking of framework error route and prevent unwanted 403 behavior during auth/controller exceptions.

2. backend/src/main/java/com/fixitnow/backend/controller/AuthController.java

- Added `HttpStatus` import.
- Register flow:
  - Added safe role parsing with `try/catch`.
  - Returns `400 Bad Request` with `Invalid role` for invalid role input.
- Login flow:
  - Changed return type to `ResponseEntity<?>`.
  - Added null checks for email/password and returns `400` when missing.
  - Returns `401` for unknown user and invalid password.
  - Returns `400` if provider profile is missing.
  - Returns `403` when provider is not approved.
  - Returns `200 OK` with `AuthResponse` on success.
- Purpose: Replace RuntimeException-based flow with explicit API status responses for cleaner frontend integration.

3. backend/src/main/java/com/fixitnow/backend/security/JwtAuthenticationFilter.java

- Removed duplicate import of `SimpleGrantedAuthority`.
- Added early bypass for `/api/auth/` endpoints.
- Replaced hard `401` on token parse failure with `SecurityContextHolder.clearContext()` and continued filter chain.
- Purpose: Keep auth endpoints truly public even if stale/invalid Authorization header is sent, reducing integration failures.

## Validation

- Ran Maven validation command:
  - `backend\\mvnw.cmd -q validate`
- Result: Success (exit code 0)

## Notes

- Only the above three backend files were modified for this task integration.
- Existing project structure and other modules remain unchanged.
