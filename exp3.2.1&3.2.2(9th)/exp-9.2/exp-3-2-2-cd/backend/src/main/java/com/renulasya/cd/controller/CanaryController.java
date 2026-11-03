package com.renulasya.cd.controller;

import com.renulasya.cd.service.CanaryService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CanaryController {

    private final CanaryService canary;

    public CanaryController(CanaryService canary) {
        this.canary = canary;
    }

    @GetMapping("/hello")
    public Map<String, Object> hello(@RequestParam(defaultValue = "user-1") String userId) {
        return canary.routeRequest(userId);
    }

    @GetMapping("/canary/stats")
    public Map<String, Object> stats() {
        return canary.stats();
    }

    @GetMapping("/canary/recent")
    public List<Map<String, Object>> recent() {
        return canary.recentRoutes();
    }

    @PostMapping("/canary/traffic")
    public Map<String, Object> setTraffic(@RequestBody Map<String, Object> body) {
        int pct = 20;
        Object raw = body.get("percent");
        if (raw instanceof Number) {
            pct = ((Number) raw).intValue();
        } else if (raw != null) {
            try {
                pct = Integer.parseInt(raw.toString().trim());
            } catch (NumberFormatException ignored) {
                pct = 20;
            }
        }
        canary.setTrafficPercent(pct);
        canary.setCanaryEnabled(pct > 0);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("message", "Canary traffic set to " + pct + "%");
        r.put("stats", canary.stats());
        r.put("submittedBy", "RENULASYA 24BAI70210");
        return r;
    }

    @PostMapping("/canary/promote")
    public Map<String, Object> promote() {
        canary.promoteCanary();
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("message", "Canary promoted to 100% (full rollout)");
        r.put("stats", canary.stats());
        return r;
    }

    @PostMapping("/canary/rollback")
    public Map<String, Object> rollback() {
        canary.rollback();
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("message", "Rolled back – 100% traffic on STABLE");
        r.put("stats", canary.stats());
        return r;
    }

    @PostMapping("/canary/reset")
    public Map<String, Object> reset() {
        canary.reset();
        canary.setTrafficPercent(20);
        canary.setCanaryEnabled(true);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("message", "Stats reset, traffic back to 20% canary");
        r.put("stats", canary.stats());
        return r;
    }

    @GetMapping("/cd/info")
    public Map<String, Object> info() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("experiment", "3.2.2");
        m.put("title", "Continuous Deployment + Canary Releases");
        m.put("submittedBy", "RENULASYA 24BAI70210");
        m.put("concepts", List.of("Continuous Deployment", "Docker containerization",
                "GitHub Actions CD", "Canary deployment"));
        m.put("dockerfile", "Dockerfile in project root");
        m.put("workflow", ".github/workflows/cd.yml");
        return m;
    }

    @GetMapping("/cd/pipeline")
    public Map<String, Object> pipeline() {
        return Map.of(
                "stages", List.of(
                        Map.of("name", "Checkout", "desc", "Pull code from GitHub"),
                        Map.of("name", "Test", "desc", "Run automated tests (CI)"),
                        Map.of("name", "Docker Build", "desc", "Build container image"),
                        Map.of("name", "Push Image", "desc", "Push to Docker Hub / registry"),
                        Map.of("name", "Canary Deploy", "desc", "Release to small % of users"),
                        Map.of("name", "Monitor", "desc", "Check errors / metrics"),
                        Map.of("name", "Promote or Rollback", "desc", "100% rollout or revert to stable")
                ),
                "submittedBy", "RENULASYA 24BAI70210"
        );
    }
}
