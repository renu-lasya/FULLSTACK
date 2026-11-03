package com.renulasya.kafka.model;

/**
 * Dashboard counters.
 */
public class Stats {
    private long totalEvents;
    private long successful;
    private long failed;
    private long retried;
    private long dlq;
    private long duplicates;
    private long processing;

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getSuccessful() { return successful; }
    public void setSuccessful(long successful) { this.successful = successful; }

    public long getFailed() { return failed; }
    public void setFailed(long failed) { this.failed = failed; }

    public long getRetried() { return retried; }
    public void setRetried(long retried) { this.retried = retried; }

    public long getDlq() { return dlq; }
    public void setDlq(long dlq) { this.dlq = dlq; }

    public long getDuplicates() { return duplicates; }
    public void setDuplicates(long duplicates) { this.duplicates = duplicates; }

    public long getProcessing() { return processing; }
    public void setProcessing(long processing) { this.processing = processing; }
}
