# Production hardened runtime image for Spring Boot
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S hams && adduser -S hams -G hams

COPY target/*.jar app.jar
RUN chown -R hams:hams /app

USER hams

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
