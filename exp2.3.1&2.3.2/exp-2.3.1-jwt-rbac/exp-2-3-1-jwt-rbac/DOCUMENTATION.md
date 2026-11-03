# Experiment Documentation – 2.3.1

## Submitted by: RENULASYA 24BAI70210

## 1. Experiment Number
2.3.1

## 2. Title
Securing Backend APIs using JWT Authentication and Role-Based Access Control (RBAC)

## 3. Aim
To implement secure backend APIs using JWT-based authentication and role-based authorization.

## 4. Objectives
- To understand JWT-based authentication
- To configure a security filter style for API protection
- To implement an authentication filter
- To enforce role-based access control using RBAC

## 5. Software Requirements
- Node.js (any recent LTS version, e.g. 18+)
- Modern web browser (Chrome / Edge / Firefox)
- VS Code (recommended)
- (Optional) curl for terminal API testing

## 6. Hardware Requirements
- Any laptop/PC capable of running Node.js
- Minimum 4 GB RAM recommended

## 7. Theory

### JWT (JSON Web Token)
A compact, URL-safe means of representing claims between two parties. A JWT has three parts:

1. **Header** – algorithm and token type  
2. **Payload** – claims (username, role, expiry, …)  
3. **Signature** – HMAC-SHA256 of header + payload using a secret key  

Because the signature is verified on every request, the server can trust the claims without storing session state.

### Spring Security / Filter Chain Concept
In frameworks such as Spring Security a chain of filters intercepts every HTTP request. One of those filters (JwtAuthenticationFilter) extracts the token, validates it, and places an Authentication object into the SecurityContext. This experiment reproduces the same idea with a pure Node.js function called `authenticate()`.

### Role-Based Access Control (RBAC)
Users are assigned roles (ADMIN, EDITOR, VIEWER). Each endpoint declares the roles that are allowed. Before returning data the server checks whether the authenticated user’s role is in the allowed list.

### Method / Endpoint Level Security
Instead of a global “all or nothing” rule, different endpoints have different rules:

- `/api/viewer` – any authenticated role  
- `/api/editor` – ADMIN or EDITOR  
- `/api/admin`  – ADMIN only  

This is the same idea as `@PreAuthorize("hasRole('ADMIN')")` in Spring.

## 8. System Architecture

```
Browser (Frontend)
      │
      │  POST /auth/login  {username, password}
      ▼
Node.js HTTP Server
      │
      ├─ Credential check (in-memory users)
      ├─ signJwt() → return token
      │
      │  GET /api/...   Authorization: Bearer <token>
      ▼
authenticate() filter
      │  verifyJwt() → extract role
      ▼
allow(user, requiredRoles)  →  200 / 401 / 403
```

## 9. Project Structure

```
exp-2-3-1-jwt-rbac/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── VIVA.md
├── DOCUMENTATION.md
├── .vscode/tasks.json
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## 10. Procedure
1. Extract the project ZIP.
2. Open the folder in VS Code.
3. Open terminal → `node server.js`.
4. Open browser → `http://localhost:4331`.
5. Log in with each of the three demo accounts and observe the different pages.

## 11. Implementation Summary

### Backend (`server.js`)
- Custom JWT sign / verify using `crypto.createHmac("sha256", SECRET)`.
- `authenticate(req)` – the security filter.
- `allow(user, roles)` – RBAC helper.
- Routes:
  - `POST /auth/login`
  - `GET /api/me`
  - `GET /api/admin`   (ADMIN)
  - `GET /api/editor`  (ADMIN, EDITOR)
  - `GET /api/viewer`  (ADMIN, EDITOR, VIEWER)
  - `GET /api/info`    (public)
- Static file serving for the frontend.

### Frontend
- Login form with one-click role buttons.
- After login the UI shows a role badge and enables/disables navigation buttons.
- Each protected page calls the corresponding API and displays the JSON response together with the filter-chain trace.
- Token Inspector decodes the JWT for learning.

## 12. API Details

| Method | Path            | Auth required | Allowed roles          | Description                |
|--------|-----------------|---------------|------------------------|----------------------------|
| POST   | /auth/login     | No            | —                      | Issue JWT                  |
| GET    | /api/me         | Yes           | any authenticated      | Current user info          |
| GET    | /api/admin      | Yes           | ADMIN                  | Admin dashboard data       |
| GET    | /api/editor     | Yes           | ADMIN, EDITOR          | Editor workspace data      |
| GET    | /api/viewer     | Yes           | ADMIN, EDITOR, VIEWER  | Viewer page data           |
| GET    | /api/info       | No            | —                      | Public experiment info     |

## 13. Database Details
No database is used. Three demo users are stored in a JavaScript array inside `server.js`.

## 14. How to Run
See **README.md** for exact step-by-step commands.

```bash
node server.js
```
Then open `http://localhost:4331`.

## 15. Expected Output
- Successful login returns a JWT and user object.
- Admin can open all three pages (green success responses).
- Editor can open Viewer + Editor; Admin page returns 403.
- Viewer can open only Viewer; Editor and Admin return 403.
- Token Inspector shows Header, Payload and Signature.
- Filter-chain trace appears in every protected response.

## 16. Learning Outcomes
- Understood how JWT authentication works without external libraries.
- Implemented a security-filter style authentication step.
- Applied role-based authorization on different endpoints.
- Observed the difference between 401 (unauthenticated) and 403 (unauthorized).
- Built a complete runnable demo that can be explained in a viva.

## 17. Conclusion
JWT combined with RBAC provides a simple, scalable and stateless way to protect backend APIs. By implementing the signing, verification and role checks ourselves we gain a clear mental model of what frameworks such as Spring Security do under the hood.
