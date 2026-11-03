package com.renulasya.kafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Experiment 3.1.1 – Kafka Reliability Mechanisms
 * Submitted by: RENULASYA 24BAI70210
 *
 * Features: Retry with exponential backoff, Dead-Letter Queue, Idempotency
 */
@SpringBootApplication
@EnableAsync
public class KafkaReliabilityApplication {

    public static void main(String[] args) {
        SpringApplication.run(KafkaReliabilityApplication.class, args);
        System.out.println();
        System.out.println("======================================================");
        System.out.println("  Experiment 3.1.1 – Kafka Reliability Mechanisms");
        System.out.println("  Submitted by: RENULASYA  24BAI70210");
        System.out.println("======================================================");
        System.out.println("  API  : http://localhost:8080");
        System.out.println("  Open frontend/index.html  |  NO Docker needed");
        System.out.println("======================================================");
        System.out.println();
    }
}
