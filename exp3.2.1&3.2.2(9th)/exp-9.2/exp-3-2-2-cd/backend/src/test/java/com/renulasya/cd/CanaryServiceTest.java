package com.renulasya.cd;

import com.renulasya.cd.service.CanaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CanaryServiceTest {

    private CanaryService service;

    @BeforeEach
    void setUp() {
        service = new CanaryService();
        ReflectionTestUtils.setField(service, "stableVersion", "1.0.0-stable");
        ReflectionTestUtils.setField(service, "canaryVersion", "1.1.0-canary");
        ReflectionTestUtils.setField(service, "canaryEnabled", true);
        ReflectionTestUtils.setField(service, "trafficPercent", 100);
    }

    @Test
    void route_allCanary_when100Percent() {
        Map<String, Object> r = service.routeRequest("u1");
        assertEquals("CANARY", r.get("track"));
    }

    @Test
    void rollback_sendsToStable() {
        service.rollback();
        Map<String, Object> r = service.routeRequest("u2");
        assertEquals("STABLE", r.get("track"));
    }

    @Test
    void promote_sets100() {
        service.promoteCanary();
        assertEquals(100, service.getTrafficPercent());
    }
}
