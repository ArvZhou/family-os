package com.family;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Family OS — Identity &amp; Core Data Service.
 *
 * Owns: users, permissions, device registry, member base data.
 * Provides REST APIs consumed by the family-service (NestJS GraphQL Gateway).
 */
@SpringBootApplication
public class FamilyApplication {

    public static void main(String[] args) {
        SpringApplication.run(FamilyApplication.class, args);
    }
}
