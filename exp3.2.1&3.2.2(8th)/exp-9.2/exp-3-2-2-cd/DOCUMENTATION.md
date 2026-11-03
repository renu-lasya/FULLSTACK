# Experiment 3.2.2 – Documentation

**Submitted by:** RENULASYA 24BAI70210

## Aim
To design and implement a Continuous Deployment pipeline with containerization and automated release strategies.

## Objectives
- Understand Continuous Deployment concepts  
- Containerize applications using Docker  
- Automate deployment using GitHub Actions  
- Implement canary deployment strategies  

## CO Mapping
CO6 – BT6

## Theory
**CD** deploys automatically after successful tests. **Docker** packages the app with dependencies. **Canary deployment** sends a new version to a small percentage of users first; if healthy, promote to everyone; if not, rollback.

## Architecture
Push → GitHub Actions (test) → Docker build/push → Canary (e.g. 20% traffic) → Monitor → Promote or Rollback.

## Procedure
1. `cd backend && mvn spring-boot:run`  
2. Open http://localhost:8080 → Canary Control → simulate traffic  
3. Show Dockerfile and `.github/workflows/cd.yml`  

## Expected Outcome
Automated CD pipeline description, Dockerized app definition, working canary traffic split demo.
