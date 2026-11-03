# Experiment 3.1.1 – Documentation

**Submitted by:** RENULASYA 24BAI70210

## 1. Aim
To implement reliability mechanisms in an event-driven system using retry strategies, Dead-Letter Queues (DLQ), and idempotency patterns.

## 2. Objectives
1. Understand failure handling in distributed systems.  
2. Implement retry with exponential backoff.  
3. Configure a Dead-Letter Queue for failed events.  
4. Ensure idempotent processing of messages.

## 3. CO Mapping
CO2 – BT2, CO3 – BT3, CO5 – BT5

## 4. Prerequisites
Java 17+, Maven, Docker, basic Kafka concepts.

## 5. Software Requirements
- JDK 17+
- Spring Boot 3.2.5
- In-memory Kafka simulation (no Docker)
- Maven
- Modern browser

## 6. Theory (short)
**Kafka** is a distributed log. Producers write to topics; consumers read. Failures need **retry** (temporary) and **DLQ** (permanent). **Idempotency** prevents double-processing when Kafka redelivers.

**Exponential backoff** spaces retries: 1s, 2s, 4s so the system can recover.

## 7. Architecture
Web UI → Spring Boot REST → Kafka Producer → `scheduled-posts` → Consumer → Idempotency → Process → Retry / DLQ (`scheduled-posts.DLT`).

## 8. Algorithm (processing)
1. Receive event from Kafka.  
2. If `eventId` already processed → mark DUPLICATE, stop.  
3. Else process (simulated success/fail based on `failureSimulation`).  
4. On failure: wait backoff, retry (max 3).  
5. If still failing → publish to DLQ and mark processed.

## 9. Implementation Procedure
See README.md (docker compose → mvn spring-boot:run → open frontend).

## 10. Code Explanation
- `PostEventProducer` – sends to main/DLQ topics.  
- `PostEventConsumer` – listens to `scheduled-posts`.  
- `EventProcessingService` – idempotency, retries, DLQ.  
- `EventStore` – in-memory logs, stats, processed IDs.  
- `EventController` – REST for the dashboard.

## 11. Testing
Use **Practical Demo** buttons: Success, Fail Once, Fail Twice, Always Fail (DLQ), Duplicate.

## 12–13. Expected / Actual Output
Live dashboard counters and event log badges: SUCCESS, RETRYING, FAILED, DLQ, DUPLICATE.

## 14. Result
Retry with exponential backoff, DLQ, and idempotency work as designed and are visible in the UI.

## 15. Learning Outcomes
- Built a Kafka producer/consumer in Spring Boot.  
- Implemented visible retry + backoff.  
- Used a DLQ topic for poison messages.  
- Enforced idempotency via eventId tracking.
