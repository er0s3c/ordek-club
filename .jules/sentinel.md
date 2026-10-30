## 2026-03-30 - Class Mode Machine Endpoint Authorization Bypass
**Vulnerability:** In class mode (`LAB_MODE=class`), machine lifecycle endpoints (`/api/machines`, `/api/machines/[id]`, `/api/conncheck`) used a `student(req)` helper that only populated student identifiers for logging/labeling, but failed to enforce mandatory authentication and container ownership checks before performing Docker container operations (list/start/stop/restart).
**Learning:** Helper functions intended for metadata labeling/audit logging can easily be mistaken for authorization guards if not explicitly enforcing session and ownership checks.
**Prevention:** Always enforce explicit `getSession(req)` checks and verify resource ownership (e.g., `m.studentId === safeLabel(userId)`) on all state-modifying API endpoints in class mode.

## 2026-03-31 - Class Mode Progress Endpoint Fallback to Global State Reset
**Vulnerability:** In class mode (`LAB_MODE=class`), `/api/progress` fell back to modifying or resetting global default progress whenever `getSession(req)` returned `null` for unauthenticated requests, allowing anonymous users to wipe global progress via `POST /api/progress`.
**Learning:** Returning default global fallback state in multi-tenant/class-mode helper functions can allow anonymous callers to manipulate global state if explicit authentication guards are omitted.
**Prevention:** In class mode (`LAB_MODE=class`), explicitly check `getSession(req)` and return `401 Unauthorized` before attempting any fallback logic on sensitive or state-modifying endpoints.
