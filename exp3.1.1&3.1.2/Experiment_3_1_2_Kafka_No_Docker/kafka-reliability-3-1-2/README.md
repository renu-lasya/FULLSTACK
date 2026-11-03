# Experiment 3.1.2 - Kafka Reliability WITHOUT Docker

This project uses Spring Kafka Embedded Kafka. Docker is NOT required.

Requirements: JDK 17+, Maven, VS Code. No Postman.

Run:
mvn spring-boot:run

Then open:
http://localhost:8080

Demo:
1. SUCCESS -> RECEIVED -> PROCESSING -> SUCCESS
2. FAIL FIRST 2 -> retry after 1s -> retry after 2s -> SUCCESS
3. ALWAYS FAIL -> 3 attempts -> DLQ
4. Duplicate Last Event -> same Event ID -> DUPLICATE blocked

The project uses actual Spring Kafka producer/consumer communication with an embedded broker.