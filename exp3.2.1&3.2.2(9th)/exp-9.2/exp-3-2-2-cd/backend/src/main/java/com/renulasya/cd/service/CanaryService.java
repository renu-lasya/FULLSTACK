package com.renulasya.cd.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simulates canary deployment traffic splitting.
 * A percentage of requests go to the canary version; the rest to stable.
 */
@Service
public class CanaryService {

    @Value("${app.version}")
    private String stableVersion;

    @Value("${app.canary.canary-version}")
    private String canaryVersion;

    @Value("${app.canary.enabled:true}")
    private boolean canaryEnabled;

    @Value("${app.canary.traffic-percent:20}")
    private int trafficPercent;

    private final AtomicInteger totalRequests = new AtomicInteger();
    private final AtomicInteger canaryHits = new AtomicInteger();
    private final AtomicInteger stableHits = new AtomicInteger();
    private final List<Map<String, Object>> recent = Collections.synchronizedList(new ArrayList<>());

    public synchronized void setTrafficPercent(int percent) {
        this.trafficPercent = Math.max(0, Math.min(100, percent));
    }

    public synchronized void setCanaryEnabled(boolean enabled) {
        this.canaryEnabled = enabled;
    }

    public int getTrafficPercent() { return trafficPercent; }
    public boolean isCanaryEnabled() { return canaryEnabled; }
    public String getStableVersion() { return stableVersion; }
    public String getCanaryVersion() { return canaryVersion; }

    /**
     * Route a request: return which version served it.
     */
    public Map<String, Object> routeRequest(String userId) {
        totalRequests.incrementAndGet();
        boolean useCanary = canaryEnabled && (Math.abs(Objects.hash(userId, totalRequests.get())) % 100) < trafficPercent;

        String version;
        String track;
        if (useCanary) {
            canaryHits.incrementAndGet();
            version = canaryVersion;
            track = "CANARY";
        } else {
            stableHits.incrementAndGet();
            version = stableVersion;
            track = "STABLE";
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", userId);
        result.put("track", track);
        result.put("version", version);
        result.put("message", track.equals("CANARY")
                ? "Served by CANARY release (new version – limited traffic)"
                : "Served by STABLE release (production)");
        result.put("submittedBy", "RENULASYA 24BAI70210");
        result.put("timestamp", new Date().toString());

        recent.add(0, result);
        if (recent.size() > 50) recent.remove(recent.size() - 1);
        return result;
    }

    public Map<String, Object> stats() {
        int total = totalRequests.get();
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("totalRequests", total);
        s.put("stableHits", stableHits.get());
        s.put("canaryHits", canaryHits.get());
        s.put("canaryEnabled", canaryEnabled);
        s.put("trafficPercent", trafficPercent);
        s.put("stableVersion", stableVersion);
        s.put("canaryVersion", canaryVersion);
        s.put("canaryActualPercent", total == 0 ? 0 : Math.round(100.0 * canaryHits.get() / total));
        s.put("submittedBy", "RENULASYA 24BAI70210");
        return s;
    }

    public List<Map<String, Object>> recentRoutes() {
        return new ArrayList<>(recent);
    }

    public void reset() {
        totalRequests.set(0);
        canaryHits.set(0);
        stableHits.set(0);
        recent.clear();
    }

    /** Promote canary to 100% (full rollout) */
    public void promoteCanary() {
        this.trafficPercent = 100;
        this.canaryEnabled = true;
    }

    /** Rollback – send all traffic to stable */
    public void rollback() {
        this.trafficPercent = 0;
        this.canaryEnabled = false;
    }
}
