package com.renulasya.kafka.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;

/**
 * Event published to Kafka topic "scheduled-posts".
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostEvent {

    private String eventId;
    private String postId;
    private String userName;
    private String platform;
    private String content;
    private String scheduledTime;
    /** SUCCESS | FAIL_ONCE | FAIL_TWICE | ALWAYS_FAIL */
    private String failureSimulation;
    private Instant timestamp;
    private int attempt;
    private String status;
    private String errorMessage;

    public PostEvent() {
        this.timestamp = Instant.now();
        this.attempt = 0;
        this.status = "RECEIVED";
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }

    public String getFailureSimulation() { return failureSimulation; }
    public void setFailureSimulation(String failureSimulation) { this.failureSimulation = failureSimulation; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public int getAttempt() { return attempt; }
    public void setAttempt(int attempt) { this.attempt = attempt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    @Override
    public String toString() {
        return "PostEvent{eventId='" + eventId + "', postId='" + postId
                + "', platform='" + platform + "', attempt=" + attempt
                + ", status='" + status + "'}";
    }
}
