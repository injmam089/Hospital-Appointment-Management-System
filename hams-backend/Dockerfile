# ================================
# Stage 1: Build Spring Boot app
# ================================
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# ================================
# Stage 2: Production runtime
# ================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user
RUN addgroup -S hams && adduser -S hams -G hams

COPY --from=builder /build/target/*.jar app.jar

RUN chown -R hams:hams /app

USER hams

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]