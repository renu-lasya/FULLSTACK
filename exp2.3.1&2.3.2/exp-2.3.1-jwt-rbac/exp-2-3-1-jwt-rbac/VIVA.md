# VIVA Preparation – Experiment 2.3.1 (JWT + RBAC)

**Student:** RENULASYA · **UID:** 24BAI70210

Answers are written in simple language suitable for a B.Tech student.

---

## 1. What is the aim of the experiment?
To implement secure backend APIs using **JWT authentication** and **role-based access control (RBAC)** so that only authorized users can access specific endpoints.

## 2. What technologies are used?
- **Node.js** (backend runtime)
- Pure **HTTP** module (no Express)
- **Crypto** module for JWT signing (HS256)
- HTML / CSS / JavaScript for the frontend
- No database, no external libraries

## 3. Why is React not used here?
The sample style uses a simple static frontend so the entire project runs with a single `node server.js` command. Conceptually the same authentication and authorization ideas apply whether the frontend is React, Vue, or plain JavaScript.

## 4. Why is Node.js used?
Node.js is lightweight, runs JavaScript on the server, and has built-in modules (`http`, `crypto`) that are enough to demonstrate JWT and RBAC without extra packages.

## 5. What is Express.js? (even though we did not use it)
Express is a popular Node.js framework that makes routing and middleware easier. In this experiment we implemented the same ideas manually so the filter-chain concept is clear.

## 6. What is a REST API?
A style of designing web services where we use standard HTTP methods (GET, POST, …) and URLs to perform operations. Example: `POST /auth/login`, `GET /api/admin`.

## 7. What is MongoDB? Why did we not use it?
MongoDB is a NoSQL database. This experiment focuses on authentication and authorization, not data persistence, so an in-memory list of users is sufficient.

## 8. What is Mongoose?
An ODM (Object Document Mapper) that makes working with MongoDB easier from Node.js. Not needed here.

## 9. Explain each important file

| File              | Purpose                                              |
|-------------------|------------------------------------------------------|
| `server.js`       | Entire backend: JWT helpers, auth filter, routes, static serving |
| `public/index.html` | Login screen + role-based pages                    |
| `public/app.js`   | Frontend logic: login, token storage, API calls      |
| `public/styles.css` | UI styling                                        |
| `README.md`       | How to run and test                                  |
| `VIVA.md`         | This file                                            |
| `DOCUMENTATION.md`| Full experiment write-up                             |

## 10. Explain the request/response flow

1. User submits username + password to `POST /auth/login`.
2. Server checks credentials against the in-memory list.
3. If correct, server creates a JWT that contains `sub` (username), `role`, `name`, `iat`, `exp`.
4. Frontend stores the token.
5. For every protected request the frontend sends  
   `Authorization: Bearer <token>`.
6. Server’s `authenticate()` function (the “filter”) verifies the signature and expiry.
7. If valid, the role is checked against the allowed roles for that endpoint.
8. Server returns 200 with data, or 401 (no/invalid token), or 403 (wrong role).

## 11. Explain the database flow
There is **no database**. Users are stored in a simple JavaScript array inside `server.js`. This keeps the focus on JWT and RBAC.

## 12. Explain authentication
Authentication answers “Who are you?”  
In this project it is done with a **JWT**. After successful login the client receives a signed token. On later requests the server verifies the token instead of asking for the password again.

## 13. Explain authorization (RBAC)
Authorization answers “What are you allowed to do?”  
Three roles exist:

- **ADMIN** → can open Viewer, Editor, Admin pages
- **EDITOR** → can open Viewer and Editor pages
- **VIEWER** → can open only the Viewer page

The helper `allow(user, ["ADMIN", "EDITOR"])` performs the check.

## 14. Explain the important algorithms / concepts

- **HS256** – HMAC-SHA256 is used to sign the JWT so the server can detect if anyone has modified the token.
- **Base64URL encoding** – used for the three parts of a JWT (header, payload, signature).
- **Filter-chain style** – every protected route first calls `authenticate()`, similar to Spring Security’s filter chain.
- **Stateless** – the server does not keep a session store; all needed information is inside the token.

## 15. Likely viva questions (with short answers)

**Q1. What does JWT stand for?**  
JSON Web Token.

**Q2. How many parts does a JWT have?**  
Three: Header, Payload, Signature — separated by dots.

**Q3. What is the difference between authentication and authorization?**  
Authentication = who you are. Authorization = what you can do.

**Q4. Why is JWT called “stateless”?**  
Because the server does not store session data; the token itself carries the claims.

**Q5. What happens if someone changes the payload of a JWT?**  
The signature will no longer match and the server rejects the token.

**Q6. What HTTP status is returned when the token is missing?**  
401 Unauthorized.

**Q7. What HTTP status is returned when the role is not allowed?**  
403 Forbidden.

**Q8. What does the `Authorization` header look like?**  
`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Q9. What is RBAC?**  
Role-Based Access Control — permissions are given according to the user’s role.

**Q10. Name the three roles in this experiment.**  
ADMIN, EDITOR, VIEWER.

**Q11. Can a VIEWER open the Admin page?**  
No — the server returns 403.

**Q12. How long is the token valid?**  
One hour (3600 seconds).

**Q13. Which Node.js module is used for signing?**  
The built-in `crypto` module (`createHmac`).

**Q14. Why do we use Base64URL instead of normal Base64?**  
Because Base64URL is safe for use inside URLs and HTTP headers (no `+`, `/`, `=`).

**Q15. What is the purpose of the `iat` and `exp` claims?**  
`iat` = issued-at time, `exp` = expiry time. They let the server reject expired tokens.

**Q16. Is the password stored in the JWT?**  
No. Only username, role, name and timestamps are stored.

**Q17. What would you change to add a new role “MANAGER”?**  
Add the user to the `USERS` array and update the `allow()` checks for the endpoints that the new role should access.

**Q18. Why is a secret key needed?**  
The same secret is used to sign and to verify the token. If the secret leaks, anyone can forge tokens.

**Q19. Does this project need `npm install`?**  
No. It uses only built-in Node.js modules.

**Q20. How do you demonstrate the experiment to the examiner?**  
Run `node server.js`, open the browser, log in as each of the three roles, and show that Admin/Editor/Viewer pages are allowed or denied correctly. Also show the Token Inspector and the filter-chain trace returned by the API.
