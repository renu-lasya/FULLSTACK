# Experiment 3.2.2 – Continuous Deployment + Canary Releases

**Submitted by:** RENULASYA · UID **24BAI70210**

**Aim:** Design and implement a Continuous Deployment pipeline with containerization and canary release strategy.

---

## Run (no Docker required for demo)

```powershell
cd exp-3-2-2-cd\backend
mvn spring-boot:run
```

Open: **http://localhost:8080**

---

## What to demonstrate

### 1. Canary Control page
- Set traffic to **20%** → **Simulate 20 user requests**
- Some users get **CANARY** (new version), most get **STABLE**
- **Promote (100%)** = full rollout  
- **Rollback** = all traffic back to stable  

### 2. CD Pipeline page
Shows stages: Test → Docker Build → Push → Canary Deploy → Promote/Rollback

### 3. Docker page
Shows Dockerfile used to containerize the Spring Boot app

### 4. GitHub Actions
File: `.github/workflows/cd.yml`  
Push to GitHub → Actions tab runs Test + Docker build + Canary deploy steps

---

## Optional: run with Docker

```powershell
# from project root (where Dockerfile is)
docker compose up --build
```

---

## Project structure
```
exp-3-2-2-cd/
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/cd.yml
├── backend/          ← Spring Boot + canary simulator + dashboard
├── README.md
├── DOCUMENTATION.md
└── VIVA.md
```
