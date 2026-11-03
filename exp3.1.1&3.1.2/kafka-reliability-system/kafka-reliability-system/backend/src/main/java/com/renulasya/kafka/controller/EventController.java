package com.renulasya.kafka.controller;

import com.renulasya.kafka.model.EventLog;
import com.renulasya.kafka.model.PostEvent;
import com.renulasya.kafka.model.Stats;
import com.renulasya.kafka.producer.PostEventProducer;
import com.renulasya.kafka.repository.EventStore;
import com.renulasya.kafka.service.EventProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * REST API used by the frontend dashboard.
 * Submitted by: RENULASYA 24BAI70210
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventController {

    private final PostEventProducer producer;
    private final EventStore store;
    private final EventProcessingService processingService;

    public EventController(PostEventProducer producer, EventStore store,
                           EventProcessingService processingService) {
        this.producer = producer;
        this.store = store;
        this.processingService = processingService;
    }

    /** Publish a new scheduled-post event to Kafka */
    @PostMapping("/events")
    public ResponseEntity<?> publish(@RequestBody PostEvent event) {
        if (event.getEventId() == null || event.getEventId().isBlank()) {
            event.setEventId("EVT-" + System.currentTimeMillis());
        }
        if (event.getPostId() == null || event.getPostId().isBlank()) {
            event.setPostId("POST-" + (100 + new Random().nextInt(900)));
        }
        if (event.getFailureSimulation() == null) {
            event.setFailureSimulation("SUCCESS");
        }
        event.setTimestamp(Instant.now());
        event.setAttempt(0);
        event.setStatus("RECEIVED");

        producer.send(event);
        store.saveEvent(event);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Event published to Kafka topic scheduled-posts");
        body.put("event", event);
        body.put("submittedBy", "RENULASYA 24BAI70210");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/events")
    public List<PostEvent> allEvents() {
        return new ArrayList<>(store.getAllEvents());
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<?> one(@PathVariable String eventId) {
        PostEvent e = store.getEvent(eventId);
        if (e == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(e);
    }

    @GetMapping("/logs")
    public List<EventLog> logs() {
        return store.getLogs();
    }

    @GetMapping("/dlq")
    public Collection<PostEvent> dlq() {
        return store.getDlqEvents();
    }

    @PostMapping("/dlq/{eventId}/retry")
    public ResponseEntity<?> retryDlq(@PathVariable String eventId) {
        try {
            processingService.retryFromDlq(eventId);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("message", "Event re-queued from DLQ to scheduled-posts");
            body.put("eventId", eventId);
            body.put("submittedBy", "RENULASYA 24BAI70210");
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/stats")
    public Stats stats() {
        return store.getStats();
    }

    @PostMapping("/reset")
    public Map<String, String> reset() {
        store.reset();
        return Map.of("message", "Stats and logs cleared", "submittedBy", "RENULASYA 24BAI70210");
    }

    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("experiment", "3.1.1");
        m.put("title", "Kafka Reliability Mechanisms");
        m.put("submittedBy", "RENULASYA 24BAI70210");
        m.put("features", List.of("Retry with exponential backoff", "Dead-Letter Queue", "Idempotency"));
        m.put("topics", List.of("scheduled-posts", "scheduled-posts.DLT"));
        m.put("maxRetries", 3);
        m.put("backoff", "1s → 2s → 4s");
        return m;
    }
}
