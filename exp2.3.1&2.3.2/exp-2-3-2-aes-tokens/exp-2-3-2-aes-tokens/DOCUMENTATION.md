# Experiment Documentation – 2.3.2

**Submitted by:** RENULASYA 24BAI70210

## 1. Experiment Number
2.3.2

## 2. Title
AES Encryption and Access / Refresh Token Lifecycle Management

## 3. Aim
To implement encryption and secure storage mechanisms for protecting sensitive data and credentials, and to manage token lifecycle using access and refresh tokens.

## 4. Objectives
- Understand encryption techniques
- Implement AES-based data encryption
- Securely store third-party credentials
- Manage token lifecycle with access and refresh tokens

## 5. Software Requirements
- Node.js (LTS)
- Modern browser
- VS Code (optional)

## 6. Hardware Requirements
Any PC/laptop that can run Node.js

## 7. Theory

### AES Encryption
AES is a symmetric block cipher. AES-256 uses a 256-bit key. CBC mode requires a random IV. Encrypting the same data twice yields different ciphertext when IVs differ.

### Access vs Refresh Tokens
- **Access token**: short-lived JWT presented on every API call.
- **Refresh token**: long-lived JWT used only to obtain a new access token.
- **Rotation**: on each refresh the old refresh token is invalidated.

### Secure Credential Storage
Secrets (OAuth client secrets, API keys) are encrypted before storage. Only ciphertext and IV are persisted. Plaintext exists only in memory during encrypt/decrypt.

## 8. System Architecture

```
Browser
  │  POST /auth/login
  ▼
Server issues accessToken (90s) + refreshToken (1h)
  │
  │  API calls with Bearer accessToken
  ▼
authenticateAccess() → verify JWT type=access
  │
  │  POST /auth/refresh { refreshToken }
  ▼
Verify + rotate → new access + new refresh
  │
  │  POST /api/credentials { secret }
  ▼
aesEncrypt() → store ciphertext + IV only
```

## 9. Project Structure
See README.md

## 10. Procedure
1. Extract ZIP, open in VS Code  
2. `node server.js`  
3. Browser → http://localhost:4332  
4. Login → explore Token Lifecycle, AES Demo, Credential Vault

## 11. Implementation Summary
- Custom JWT (HS256) with `type` claim (`access` / `refresh`)
- AES-256-CBC via Node `crypto`
- In-memory user list, refresh store, credential vault
- Frontend with live access-token countdown

## 12. API Details

| Method | Path                         | Auth          | Description                    |
|--------|------------------------------|---------------|--------------------------------|
| POST   | /auth/login                  | No            | Issue access + refresh tokens  |
| POST   | /auth/refresh                | No (body)     | Rotate & issue new pair        |
| POST   | /auth/logout                 | Optional      | Revoke refresh token           |
| GET    | /api/me                      | Access token  | Current user + expiry          |
| POST   | /api/credentials             | Access token  | Encrypt & store secret         |
| GET    | /api/credentials             | Access token  | List ciphertext only           |
| POST   | /api/credentials/decrypt     | Access token  | Decrypt by id                  |
| POST   | /api/demo/encrypt            | No            | AES demo encrypt               |
| POST   | /api/demo/decrypt            | No            | AES demo decrypt               |
| GET    | /api/info                    | No            | Experiment metadata            |

## 13. Database
None. All data is in-memory for this experiment.

## 14. How to Run
```bash
node server.js
```
Open http://localhost:4332

## 15. Expected Output
- Login returns both tokens and `submittedBy: "RENULASYA 24BAI70210"`
- Access token expires after ~90s; /api/me returns 401
- Refresh returns new tokens; old refresh fails
- Credential vault stores only ciphertext; decrypt returns original secret
- AES demo encrypt/decrypt works for arbitrary text

## 16. Learning Outcomes
- Implemented AES-256-CBC encrypt/decrypt
- Understood access vs refresh token strategy and rotation
- Practised secure storage (never store plaintext secrets)
- Observed full token lifecycle in a browser UI

## 17. Conclusion
Combining short-lived access tokens with refresh tokens and AES-encrypted credential storage significantly improves backend security while remaining practical for real systems.
