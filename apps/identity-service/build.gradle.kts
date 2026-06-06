plugins {
    java
    id("org.springframework.boot") version "3.4.0"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.family"
version = "0.1.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

val springdocVersion = "2.7.0"

dependencies {
    // Web
    implementation("org.springframework.boot:spring-boot-starter-web")

    // Data JPA
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")

    // OAuth2 Resource Server
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

    // PostgreSQL
    runtimeOnly("org.postgresql:postgresql")

    // Flyway
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // SpringDoc OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
