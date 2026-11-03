# Experiment 3.2.2 – Docker image for CD lab
# Build:  docker build -t renulasya/cd-canary-lab:1.0 .
# Run:    docker run -p 8080:8080 renulasya/cd-canary-lab:1.0

FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
# Use Maven wrapper alternative – install maven in image
RUN apk add --no-cache maven && mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
LABEL maintainer="RENULASYA 24BAI70210"
LABEL experiment="3.2.2 Continuous Deployment + Canary"
