# VIVA – Experiment 3.2.2 CD + Canary

**Student:** RENULASYA · **UID:** 24BAI70210

**Q1. What is Continuous Deployment?**  
Automatically deploying the application after tests pass, without manual release steps.

**Q2. Difference between CI and CD?**  
CI = build + test on every push. CD = also deploy automatically after CI succeeds.

**Q3. What is Docker?**  
A platform to package an app with its dependencies into a portable container image.

**Q4. What is a Dockerfile?**  
A text file of instructions to build a Docker image (FROM, COPY, RUN, EXPOSE, ENTRYPOINT).

**Q5. Why containerize?**  
Same behaviour on laptop, server, and cloud — fewer “works on my machine” issues.

**Q6. What is canary deployment?**  
Release the new version to a small % of users first; expand only if metrics look good.

**Q7. Why use canary?**  
Limits blast radius of bugs; easy rollback if the canary misbehaves.

**Q8. What is rollback?**  
Switch all traffic back to the previous stable version.

**Q9. What is promote?**  
Increase canary traffic to 100% so the new version becomes the new stable.

**Q10. Role of GitHub Actions in CD?**  
Automates test, image build, and deploy steps on every push.

**Q11. Where is the CD workflow file?**  
`.github/workflows/cd.yml`

**Q12. What does traffic-percent mean?**  
Share of requests sent to the canary version (e.g. 20% canary, 80% stable).

**Q13. Stages of this CD pipeline?**  
Checkout → Test → Docker Build → Push → Canary Deploy → Monitor → Promote/Rollback.

**Q14. How do you demo canary without a real cluster?**  
This lab simulates routing inside the app and shows STABLE vs CANARY hits on the dashboard.

**Q15. Expected outcome?**  
Automated deployment pipeline, Dockerized app, reliable canary release strategy.
