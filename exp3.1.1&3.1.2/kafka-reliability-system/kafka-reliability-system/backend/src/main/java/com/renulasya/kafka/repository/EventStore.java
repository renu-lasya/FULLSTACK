package com.renulasya.kafka.repository;

import com.renulasya.kafka.model.EventLog;
import com.renulasya.kafka.model.PostEvent;
import com.renulasya.kafka.model.Stats;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory store for:
 *  - processed event IDs (idempotency)
 *  - event logs (UI table)
 *  - DLQ events
 *  - dashboard stats
 */
@Component
public class EventStore {

    /** eventId → true once successfully processed (or permanently failed to DLQ) */
    private final Set<String> processedIds = ConcurrentHashMap.newKeySet();

    /** All log entries (newest first conceptually) */
    private final List<EventLog> logs = new CopyOnWriteArrayList<>();

    /** Events currently in DLQ (eventId → PostEvent) */
    private final Map<String, PostEvent> dlq = new ConcurrentHashMap<>();

    /** Latest status per eventId */
    private final Map<String, PostEvent> events = new ConcurrentHashMap<>();

    private final AtomicLong total = new AtomicLong();
    private final AtomicLong success = new AtomicLong();
    private final AtomicLong failed = new AtomicLong();
    private final AtomicLong retried = new AtomicLong();
    private final AtomicLong dlqCount = new AtomicLong();
    private final AtomicLong duplicates = new AtomicLong();
    private final AtomicLong processing = new AtomicLong();

    public boolean isProcessed(String eventId) {
        return processedIds.contains(eventId);
    }

    public void markProcessed(String eventId) {
        processedIds.add(eventId);
    }

    public void unmarkProcessed(String eventId) {
        processedIds.remove(eventId);
    }

    public void addLog(EventLog log) {
        logs.add(0, log); // newest first
        if (logs.size() > 500) {
            logs.remove(logs.size() - 1);
        }
    }

    public List<EventLog> getLogs() {
        return new ArrayList<>(logs);
    }

    public void saveEvent(PostEvent e) {
        events.put(e.getEventId(), e);
    }

    public PostEvent getEvent(String eventId) {
        return events.get(eventId);
    }

    public Collection<PostEvent> getAllEvents() {
        return events.values();
    }

    public void addToDlq(PostEvent e) {
        dlq.put(e.getEventId(), e);
    }

    public void removeFromDlq(String eventId) {
        dlq.remove(eventId);
    }

    public Collection<PostEvent> getDlqEvents() {
        return dlq.values();
    }

    public PostEvent getDlqEvent(String eventId) {
        return dlq.get(eventId);
    }

    // ---- stats helpers ----
    public void incTotal() { total.incrementAndGet(); }
    public void incSuccess() { success.incrementAndGet(); }
    public void incFailed() { failed.incrementAndGet(); }
    public void incRetried() { retried.incrementAndGet(); }
    public void incDlq() { dlqCount.incrementAndGet(); }
    public void incDuplicates() { duplicates.incrementAndGet(); }
    public void incProcessing() { processing.incrementAndGet(); }
    public void decProcessing() {
        long v = processing.decrementAndGet();
        if (v < 0) processing.set(0);
    }

    public Stats getStats() {
        Stats s = new Stats();
        s.setTotalEvents(total.get());
        s.setSuccessful(success.get());
        s.setFailed(failed.get());
        s.setRetried(retried.get());
        s.setDlq(dlqCount.get());
        s.setDuplicates(duplicates.get());
        s.setProcessing(processing.get());
        return s;
    }

    public void reset() {
        processedIds.clear();
        logs.clear();
        dlq.clear();
        events.clear();
        total.set(0);
        success.set(0);
        failed.set(0);
        retried.set(0);
        dlqCount.set(0);
        duplicates.set(0);
        processing.set(0);
    }
}
