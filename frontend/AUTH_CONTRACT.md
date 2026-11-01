# Authentication integration — FE1

## Git / scope

- Main synced and merged into FE1 at `9956ef1` (fast-forward, no conflicts).
- Pre-sync changes were stashed and restored. No backend source was changed.
- Auth requirements were revised on 2026-10-07: call auth-service directly, remove
  unsupported Auth features and support ADMIN / SALES / MANAGER only.
- **User-confirmed exception:** implement username/password login now, explicitly
  waiting for backend to change. This is NOT end-to-end compatible with backend
  login in commit `9956ef1`, which still accepts email/password.

## Contract: source versus requested frontend

Source paths under `backend/auth-service/src/main/java/auth_service/`:
`controller/AuthController.java`, `dto/request/*`, `dto/response/AuthResponse.java`,
`service/impl/AuthServiceImpl.java`, `exception/GlobalExceptionHandler.java`,
`entity/Role.java`, `config/SecurityConfig.java`, `jwt/JwtService.java` and
`jwt/JwtFilter.java`.

| Operation | Current backend | Frontend request |
| --- | --- | --- |
| Register | POST /api/auth/register; username, email, password | Same, no confirmPassword or role |
| Login | POST /api/auth/login; **email**, password; findByEmail | **username**, password, per explicit user decision |

Register returns HTTP 200:
`{ token: null, username, role: "SALES", message: "Register successful" }`.
It hashes passwords with BCrypt, defaults role to SALES and does not authenticate
or send email. Required fields are non-blank; email has @Email validation.
No password-length/complexity rule exists in the DTO.

Login returns HTTP 200:
`{ token: string, username: string, role: "ADMIN" | "SALES" | "MANAGER", message: string }`.
No user ID, user email, verification status or additional token fields are returned.
The frontend validates these actual response fields; it does not fabricate user data.

Current error body: `{ message, status, timestamp }`, no error code:

- Register duplicate email: 400, `Email already exists`.
- Login unknown email: 404, `User not found`.
- Login wrong password: 401, `Invalid password`.
- DTO validation uses default Spring handling.

Frontend displays the server's non-empty message when present; otherwise it shows
a generic status error or a network/timeout message.

## Configuration / actual requests

`.env.development` contains `VITE_AUTH_API_BASE_URL=http://localhost:8081`,
matching auth-service's application.properties. Override with an environment
variable or `.env.development.local` for a different server.

Only these Auth requests exist in runtime:

- `POST ${VITE_AUTH_API_BASE_URL}/api/auth/register`
- `POST ${VITE_AUTH_API_BASE_URL}/api/auth/login`

Set the variable to the service **origin**, without the /api/auth suffix.
Production must supply it in build environment or `.env.production.local`
(see `.env.example`); Vite embeds the value at build time. Missing configuration
produces a visible error and does not silently call the frontend origin.

The existing `VITE_API_BASE_URL` still configures other CRM services independently.
Their existing mock configuration has not been switched to real APIs.

No Auth call goes through gateway port 8080. The gateway currently has only
/health, with no Auth forwarding/security/CORS configuration. No route or proxy
was invented in frontend or backend.

## Session, routes and roles

- Zustand holds `user: { username, role }`, `token`, `isAuthenticated`,
  and submission loading state.
- Login persists only `{ token, user: { username, role } }` under localStorage
  key `crm-soa.auth.backend.v1`; never a password.
- Reload synchronously restores those fields. Malformed data or unsupported
  roles are rejected. Legacy `crm-soa.auth.v2` mock sessions are not restored.
- Restoration is UI persistence, not server verification. There is no current-user
  endpoint. LocalStorage is readable by same-origin JavaScript; production must
  mitigate XSS and use HTTPS.
- ProtectedRoute redirects unauthenticated users to /login. PublicOnlyRoute
  does not unmount the form during submission, so errors stay visible.
- Shared protected Axios requests add Bearer only when a token exists.
  A matching-session 401 clears local Auth once, with no refresh/retry request.
  A late 401 from an old token cannot clear a newer token's session.
- Public register/login requests do not carry the old token.
- Logout removes the session key, clears Zustand and navigates to /login.
  There is no revoke API; server tokens are not invalidated by local logout.
- One role type is shared across Auth and settings: ADMIN, SALES, MANAGER.
  There is no SUPPORT alias or mapping.
- UI permission policy in rolePermissions.ts: ADMIN retains all permissions;
  SALES retains sales/customer modules; MANAGER has business modules including
  tickets and analytics, but not administrative settings. This is a frontend
  visibility policy, not a claim that the backend enforces these permissions.
- Account/header display uses username, not invented fullName/email/ID.
  Old profile-to-mock-user binding was removed. Demo settings users remain
  separate from real authentication; unsupported-role mock seed rows were removed,
  not reassigned. Old persisted demo rows with invalid roles are filtered out.

## Removed unsupported functionality

Removed mock Auth service/data and its imports; Google button/account chooser;
verification/check-email pages; forgot/reset pages, links and schema;
additional-token storage and renewal logic; unsupported role options.

Also removed the profile editor that bound authenticated accounts to mock user
IDs, and the settings page's fake password change / logout-all-sessions actions.
No unsupported Auth buttons, placeholders, requests or service methods remain.
Auth service has exactly `login` and `register`.
Deleted tracked source can be recovered from Git.

## Backend work still required

1. **Username login:** update LoginRequest, service lookup and validation to the
   agreed username/password contract. Define/enforce username uniqueness before
   using it as a login identifier. Frontend does not fall back to email.
2. **Local database:** starting the built auth-service fails with
   `FATAL: role "postgres" does not exist`. Configure the local PostgreSQL
   role/database/credentials; the frontend task has not changed the database.
3. **CORS:** SecurityConfig has no CORS configuration. Allow the actual frontend
   origin, methods and headers on auth-service before direct browser calls can
   work. No browser bypass or dev proxy was added.
4. **JWT validation:** generateToken uses email as subject, but isTokenValid
   compares it to username; align generation and validation. JwtFilter currently
   builds Authentication with no authorities and does not translate invalid/
   expired JWT exceptions into a reliable 401.
5. Gateway Auth forwarding can be implemented by the backend later; it is not
   needed by the currently requested direct-service frontend configuration.

## Verification

Commands from frontend:

```sh
npm run build
npm run lint
npm run test:auth
```

The browser tests require Google Chrome. Alternatively install Playwright's
Chromium and run `PLAYWRIGHT_CHANNEL=chromium npm run test:auth`.
The test runner starts its own Vite server on 127.0.0.1:4179 and uses isolated
browser contexts. Auth responses are intercepted **only inside tests**; no test
fixture is imported by production/development Auth code.

| Check | Result / interpretation |
| --- | --- |
| Frontend build | PASS; existing >500 kB bundle warning |
| Frontend lint | PASS |
| Browser contract/UI suite | 21 PASS |
| Register browser flow | PASS with intercepted backend-shaped response; exact DTO, validation, no duplicate submit, login redirect |
| Username login browser flow | PASS with intercepted response for all three roles |
| Reload / protected route / local logout | PASS; no extra Auth requests |
| Errors / missing fields / unknown roles / malformed storage | PASS |
| Bearer / 401 / late old-token 401 | PASS; no refresh/retry |
| Mobile registration form | PASS: spacing and viewport fit |
| Backend compile/package | PASS using sh mvnw -B -DskipTests package (not backend tests) |
| Live Register / Login | BLOCKED: auth-service fails to start because of PostgreSQL configuration |
| Live username login | Also BLOCKED by email-only backend contract |
| Verify / Google / other unsupported APIs | Removed, not implemented or tested as success |

These results do not claim live end-to-end integration. After backend fixes,
repeat register → username login → reload → protected API → logout against the
real service with browser Network tools, without response interception.

## Changed-file inventory (paths relative to frontend)

Modified:

- `.gitignore`
- `package-lock.json`
- `package.json`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/settings/UserForm.tsx`
- `src/config/rolePermissions.ts`
- `src/mocks/users.ts`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/settings/ProfilePage.tsx`
- `src/pages/settings/RoleManagementPage.tsx`
- `src/pages/settings/SecuritySettingsPage.tsx`
- `src/pages/settings/UserManagementPage.tsx`
- `src/routes/AppRoutes.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/routes/PublicOnlyRoute.tsx`
- `src/services/api.ts`
- `src/services/authService.ts`
- `src/services/userService.ts`
- `src/stores/authStore.ts`
- `src/types/auth.ts`
- `src/types/user.ts`
- `src/utils/loginSchema.ts`
- `src/utils/registerSchema.ts`
- `src/utils/settingsSchema.ts`

Added:

- `.env.development`
- `.env.example`
- `AUTH_CONTRACT.md`
- `playwright.config.mjs`
- `src/utils/authSession.ts`
- `tests/auth.spec.ts`

Deleted (recoverable from Git):

- `src/components/auth/GoogleLoginButton.tsx`
- `src/components/settings/ProfileForm.tsx`
- `src/mocks/auth.ts`
- `src/pages/auth/ForgotPasswordPage.tsx`
- `src/pages/auth/ResetPasswordPage.tsx`
- `src/pages/auth/VerifyEmailPendingPage.tsx`
- `src/pages/auth/VerifyEmailSuccessPage.tsx`
- `src/utils/resetPasswordSchema.ts`

The dashboard change only replaces the removed role comparison with the shared
permission check. Other CRM business logic and data services are unchanged.
Settings changes remove Auth identity assumptions and obsolete role choices;
they do not add backend user-management integration.

Additional dependency check: npm audit reports two existing high-severity
transitive vulnerabilities, in brace-expansion and source-map-js. Their affected
versions were already present in the main lockfile; this Auth change did not
upgrade unrelated dependencies. Review them separately before production.
