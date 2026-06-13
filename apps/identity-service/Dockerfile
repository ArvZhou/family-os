# identity-service (Spring Boot) — Multi-stage Docker Build
# Build context: apps/identity-service
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY gradlew build.gradle.kts settings.gradle.* gradle.properties ./
COPY gradle gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 javauser && \
    adduser --system --uid 1001 javauser
COPY --from=builder /app/build/libs/*.jar app.jar
USER javauser
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
