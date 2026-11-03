package com.renulasya.cd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Experiment 3.2.2 – Continuous Deployment + Canary Releases
 * Submitted by: RENULASYA 24BAI70210
 */
@SpringBootApplication
public class CdCanaryApplication {
    public static void main(String[] args) {
        SpringApplication.run(CdCanaryApplication.class, args);
        System.out.println();
        System.out.println("======================================================");
        System.out.println("  Experiment 3.2.2 – Continuous Deployment + Canary");
        System.out.println("  Submitted by: RENULASYA  24BAI70210");
        System.out.println("======================================================");
        System.out.println("  Dashboard : http://localhost:8080");
        System.out.println("======================================================");
        System.out.println();
    }
}
