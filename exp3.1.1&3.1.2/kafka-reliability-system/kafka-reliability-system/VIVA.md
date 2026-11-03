# VIVA – Experiment 3.1.1 Kafka Reliability

**Student:** RENULASYA · **UID:** 24BAI70210

---

**Q1. What is Apache Kafka?**  
A distributed event streaming platform used to publish and subscribe to streams of records (messages).

**Q2. What is a producer?**  
A client that sends (publishes) messages to a Kafka topic.

**Q3. What is a consumer?**  
A client that reads messages from a Kafka topic.

**Q4. What is a Kafka topic?**  
A named category/feed to which records are published. We use `scheduled-posts` and `scheduled-posts.DLT`.

**Q5. What is a consumer group?**  
A group of consumers that share the work of reading a topic. Our group id is `post-processor-group`.

**Q6. What is event-driven architecture?**  
Components communicate by producing and consuming events instead of direct synchronous calls.

**Q7. What is asynchronous communication?**  
The sender does not wait for the receiver to finish; it publishes and continues.

**Q8. What is retry?**  
Processing the same message again after a failure, hoping the next attempt succeeds.

**Q9. What is exponential backoff?**  
Increasing the wait time between retries (here: 1s → 2s → 4s) so the system is not overloaded.

**Q10. Why do we need retry?**  
Temporary failures (network blips, overloaded service) may succeed on a later attempt.

**Q11. What is DLQ (Dead Letter Queue)?**  
A special topic that stores messages that failed after all retries, so they are not lost and can be inspected/reprocessed.

**Q12. Why is DLQ required?**  
Without DLQ, permanently failing messages could block the pipeline or be dropped silently.

**Q13. What is idempotency?**  
Processing the same event more than once has the same effect as processing it once. We track `eventId` and skip duplicates.

**Q14. Why is idempotency important in Kafka?**  
Kafka can deliver a message more than once (at-least-once). Without idempotency, duplicates would cause double side-effects.

**Q15. What is at-least-once delivery?**  
A message is guaranteed to be delivered one or more times; never zero times. Duplicates are possible.

**Q16. What happens when processing fails?**  
We retry with backoff up to 3 times; if still failing, we send the event to the DLQ topic.

**Q17. What is fault tolerance?**  
The system continues correctly even when some components fail, using retries and DLQ.

**Q18. Difference between retry and DLQ?**  
Retry = try again soon. DLQ = after all retries fail, park the message for later analysis.

**Q19. Why can duplicate messages occur?**  
Producer retries, consumer rebalance, or at-least-once semantics can cause the same message to appear twice.

**Q20. Explain the complete project flow.**  
UI → REST API → Kafka Producer → topic `scheduled-posts` → Consumer → Idempotency check → Process → on failure Retry (1s/2s/4s) → after max retries → DLQ topic `scheduled-posts.DLT`. Dashboard shows live stats and logs.

**Q21. Which Spring Boot version?** 3.2.5 with Java 17.

**Q22. How do you start Kafka?** `docker compose up -d`

**Q23. What is the max retry count?** 3

**Q24. How is failure simulated?** Field `failureSimulation`: SUCCESS, FAIL_ONCE, FAIL_TWICE, ALWAYS_FAIL.

**Q25. Who submitted this experiment?** RENULASYA, UID 24BAI70210.
