package com.renulasya.kafka.service;

import com.renulasya.kafka.model.EventLog;
import com.renulasya.kafka.model.PostEvent;
import com.renulasya.kafka.producer.PostEventProducer;
import com.renulasya.kafka.repository.EventStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Core processing: idempotency check, simulated work, retry with exponential backoff, DLQ.
 */
@Service
public class EventProcessingService {

    private static final Logger log = LoggerFactory.getLogger(EventProcessingService.class);

    private final EventStore store;
    private final PostEventProducer producer;

    @Value("${app.retry.max-attempts:3}")
    private int maxAttempts;

    /** delays in ms – Retry1=1s, Retry2=2s, Retry3=4s */
    private final long[] delays = {1000L, 2000L, 4000L};

    public EventProcessingService(EventStore store, PostEventProducer producer) {
        this.store = store;
        this.producer = producer;
    }

    /**
     * Entry point called by the Kafka consumer for each message.
     */
    public void process(PostEvent event) {
        String eventId = event.getEventId();

        // ---- IDEMPOTENCY ----
        if (store.isProcessed(eventId)) {
            log.warn("DUPLICATE detected for eventId={}", eventId);
            store.incDuplicates();
            store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                    "DUPLICATE", event.getAttempt(),
                    "Duplicate detected – processing skipped", null));
            event.setStatus("DUPLICATE");
            store.saveEvent(event);
            return;
        }

        store.incTotal();
        store.incProcessing();
        event.setStatus("PROCESSING");
        store.saveEvent(event);
        store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                "RECEIVED", 0, "Event received from Kafka", null));

        int attempt = 0;
        boolean success = false;
        String lastError = null;

        while (attempt < maxAttempts && !success) {
            attempt++;
            event.setAttempt(attempt);
            event.setStatus("PROCESSING");
            store.saveEvent(event);

            log.info("Processing eventId={} attempt={}/{}", eventId, attempt, maxAttempts);
            store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                    "PROCESSING", attempt,
                    "Attempt " + attempt + " started", null));

            try {
                doWork(event, attempt);
                success = true;
                event.setStatus("SUCCESS");
                event.setErrorMessage(null);
                store.markProcessed(eventId);
                store.incSuccess();
                store.saveEvent(event);
                store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                        "SUCCESS", attempt,
                        "Processed successfully on attempt " + attempt, null));
                log.info("SUCCESS eventId={} on attempt {}", eventId, attempt);
            } catch (Exception ex) {
                lastError = ex.getMessage();
                event.setErrorMessage(lastError);
                event.setStatus("FAILED");
                store.incFailed();
                store.saveEvent(event);
                store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                        "FAILED", attempt,
                        "Attempt " + attempt + " failed", lastError));
                log.warn("FAILED eventId={} attempt={} reason={}", eventId, attempt, lastError);

                if (attempt < maxAttempts) {
                    long delay = delays[Math.min(attempt - 1, delays.length - 1)];
                    store.incRetried();
                    event.setStatus("RETRYING");
                    store.saveEvent(event);
                    store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                            "RETRYING", attempt,
                            "Waiting " + (delay / 1000) + "s before retry " + (attempt + 1), null));
                    log.info("RETRY eventId={} waiting {}ms before attempt {}", eventId, delay, attempt + 1);
                    sleep(delay);
                }
            }
        }

        if (!success) {
            // All retries exhausted → DLQ
            event.setStatus("DLQ");
            event.setErrorMessage(lastError != null ? lastError : "Max retries exceeded");
            store.markProcessed(eventId); // prevent re-processing from main topic as new
            store.addToDlq(event);
            store.incDlq();
            store.saveEvent(event);
            producer.sendToDlq(event);
            store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                    "DLQ", attempt,
                    "Moved to Dead-Letter Queue after " + attempt + " attempts", lastError));
            log.error("DLQ eventId={} after {} attempts", eventId, attempt);
        }

        store.decProcessing();
    }

    /**
     * Simulated business logic controlled by failureSimulation field.
     */
    private void doWork(PostEvent event, int attempt) throws Exception {
        // Small artificial work delay
        sleep(300);

        String sim = event.getFailureSimulation() != null
                ? event.getFailureSimulation().toUpperCase()
                : "SUCCESS";

        switch (sim) {
            case "FAIL_ONCE":
                if (attempt == 1) throw new RuntimeException("Simulated failure on attempt 1");
                break;
            case "FAIL_TWICE":
                if (attempt <= 2) throw new RuntimeException("Simulated failure on attempt " + attempt);
                break;
            case "ALWAYS_FAIL":
                throw new RuntimeException("Simulated permanent failure");
            case "SUCCESS":
            default:
                // success
                break;
        }
        // If we reach here → success
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /** Re-process an event from DLQ (resets attempt and removes from DLQ). */
    public void retryFromDlq(String eventId) {
        PostEvent event = store.getDlqEvent(eventId);
        if (event == null) {
            throw new IllegalArgumentException("Event not found in DLQ: " + eventId);
        }
        store.removeFromDlq(eventId);
        store.unmarkProcessed(eventId);
        event.setAttempt(0);
        event.setStatus("RECEIVED");
        event.setErrorMessage(null);
        event.setFailureSimulation("SUCCESS"); // retry from DLQ as success by default
        store.saveEvent(event);
        producer.send(event);
        store.addLog(new EventLog(eventId, event.getPostId(), event.getPlatform(),
                "RECEIVED", 0, "Re-queued from DLQ", null));
    }
}
