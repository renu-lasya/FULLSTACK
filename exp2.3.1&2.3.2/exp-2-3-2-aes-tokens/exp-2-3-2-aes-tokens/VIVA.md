# VIVA – Experiment 2.3.2 (AES + Access/Refresh Tokens)

**Student:** RENULASYA · **UID:** 24BAI70210

Answers in simple language for a B.Tech viva.

---

## 1. What is the aim of the experiment?
To implement **AES encryption** for protecting sensitive data and to manage **access + refresh token** lifecycle so that short-lived tokens reduce risk while long-lived refresh tokens keep the session usable.

## 2. What technologies are used?
Node.js, built-in `crypto` and `http` modules, plain HTML/CSS/JS frontend. No Express, no MongoDB, no external libraries.

## 3. What is AES?
AES (Advanced Encryption Standard) is a **symmetric** encryption algorithm. The same secret key is used to encrypt and decrypt. We use **AES-256-CBC** (256-bit key, Cipher Block Chaining mode).

## 4. Why do we need an IV (Initialization Vector)?
CBC mode needs a random IV so that encrypting the same plaintext twice produces different ciphertext. This prevents pattern analysis. The IV is stored alongside the ciphertext (it is not secret).

## 5. What is the difference between access token and refresh token?

|                | Access Token              | Refresh Token                |
|----------------|---------------------------|------------------------------|
| Lifetime       | Short (90 seconds here)   | Long (1 hour here)           |
| Purpose        | Call protected APIs       | Obtain a new access token    |
| Sent with      | Every API request         | Only to `/auth/refresh`      |
| If stolen      | Limited damage (expires soon) | Can be rotated / revoked  |

## 6. What is token rotation?
When the client refreshes, the server issues a **new** refresh token and **invalidates** the old one. If an attacker stole the old refresh token, it no longer works after rotation.

## 7. How is sensitive data stored?
Plaintext is never stored. The server encrypts the secret with AES-256-CBC and saves only **ciphertext + IV**. Decryption happens only when an authorized user requests it.

## 8. Explain the request flow for storing a credential
1. Client sends access token + `{ label, secret }`.
2. Server verifies the access token.
3. Server calls `aesEncrypt(secret)` → ciphertext + IV.
4. Entry is pushed to the in-memory vault.
5. Response returns id, label, ciphertext (no plaintext).

## 9. What HTTP status is returned when the access token expires?
**401 Unauthorized**, with a tip to call `/auth/refresh`.

## 10. Which Node.js module provides AES?
The built-in **`crypto`** module (`createCipheriv`, `createDecipheriv`).

## 11–20. More likely questions

**Q11. Is AES asymmetric or symmetric?** Symmetric.

**Q12. Why not store the password in the JWT?** JWT is not for secrets; we only put non-sensitive claims (username, type, expiry).

**Q13. What does “stateless” mean for access tokens?** The server does not keep a session table for access tokens; it only verifies the signature and expiry.

**Q14. Where is the refresh token stored on the server?** In an in-memory Map (`refreshStore`) keyed by username, so we can revoke or rotate it.

**Q15. What happens on logout?** The refresh token is deleted from the store, so further refresh attempts fail.

**Q16. Can you decrypt without the correct key?** No — wrong key produces garbage or an error.

**Q17. Why is the access token short-lived?** Limits the window of abuse if the token is stolen.

**Q18. What is the full algorithm name used?** AES-256-CBC.

**Q19. Do we need npm install?** No — only built-in modules.

**Q20. How do you demonstrate to the examiner?**  
Run `node server.js` → open browser → login → show countdown → wait for expiry → Test /api/me (401) → Refresh → success → Encrypt a secret in the vault → List (ciphertext only) → Decrypt.
