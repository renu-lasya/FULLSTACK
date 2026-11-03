package com.renulasya.kafka.model;

import java.time.Instant;
import java.util.UUID;

/**
 * One log line shown in the Event Monitor / Live Activity panel.
 */
public class EventLog {

    private String id;
    private String eventId;
    private String postId;
    private String platform;
    private String status;   // RECEIVED, PROCESSING, SUCCESS, RETRYING, FAILED, DLQ, DUPLICATE
    private int attempt;
    private String message;
    private String error;
    private Instant timestamp;

    public EventLog() {
        this.id = UUID.randomUUID().toString().substring(0, 8);
        this.timestamp = Instant.now();
    }

    public EventLog(String eventId, String postId, String platform, String status,
                    int attempt, String message, String error) {
        this();
        this.eventId = eventId;
        this.postId = postId;
        this.platform = platform;
        this.status = status;
        this.attempt = attempt;
        this.message = message;
        this.error = error;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getAttempt() { return attempt; }
    public void setAttempt(int attempt) { this.attempt = attempt; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
