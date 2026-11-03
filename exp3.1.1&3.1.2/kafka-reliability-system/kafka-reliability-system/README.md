# Experiment 3.1.1 – Kafka Reliability Mechanisms

**Submitted by:** RENULASYA · UID **24BAI70210**

**NO Docker required.** Kafka is simulated in-memory inside Spring Boot so you only need Java + Maven.

---

## Prerequisites

- **Java 17+** → `java -version`
- **Maven 3.8+** → `mvn -version`

(No Docker, no external Kafka.)

---

## Run (VS Code)

### Step 1 – Backend
```powershell
cd C:\Users\lasya\Downloads\kafka-reliability-system\kafka-reliability-system\backend
mvn spring-boot:run
```

Wait until you see:
```
Experiment 3.1.1 – Kafka Reliability Mechanisms
Submitted by: RENULASYA  24BAI70210
API  : http://localhost:8080
```

### Step 2 – Frontend
Open in Chrome/Edge:

```
C:\Users\lasya\Downloads\kafka-reliability-system\kafka-reliability-system\frontend\index.html
```

Sidebar should show **API online**.

---

## What is simulated

| Real Kafka concept        | In this project                          |
|---------------------------|------------------------------------------|
| Topic `scheduled-posts`   | In-memory queue                          |
| Topic `scheduled-posts.DLT` | In-memory DLQ queue                    |
| Producer                  | `PostEventProducer` → queue              |
| Consumer                  | Background thread reads queue & processes|
| Retry + backoff           | 1s → 2s → 4s (max 3 attempts)            |
| Idempotency               | `eventId` set in memory                  |

All dashboard features (Success / Retry / DLQ / Duplicate) work the same.

---

## Demo for teacher

1. Open **Practical Demo**
2. Click:
   - Test Success
   - Test Retry (Fail Once / Fail Twice)
   - Test DLQ (Always Fail)
   - Test Duplicate
3. Watch **Dashboard**, **Event Monitor**, **Dead Letter Queue**

---

## If `mvn` is not found

Install Maven or use the Maven wrapper. Or install JDK 17 and Maven from:

- Java: https://adoptium.net/
- Maven: https://maven.apache.org/download.cgi

Add them to PATH, open a **new** PowerShell, try again.

---

## Stop

Press `Ctrl + C` in the terminal where Spring Boot is running.
