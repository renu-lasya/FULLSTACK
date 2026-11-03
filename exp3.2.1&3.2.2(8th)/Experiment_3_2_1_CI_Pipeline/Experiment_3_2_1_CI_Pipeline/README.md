# Experiment 3.2.1 — Continuous Integration Pipeline

Beginner-friendly Spring Boot project with an interactive browser dashboard, JUnit 5 unit tests, MockMvc API tests, a lightweight response contract test, Pact and Testcontainers dependencies, and GitHub Actions CI.

## Requirements
- JDK 17+
- Maven 3.9+
- VS Code
- Internet for the first Maven dependency download
- Docker is only needed when adding/running Docker-backed Testcontainers tests

## Run on Windows in VS Code
1. Extract the ZIP.
2. Open the extracted `ci-pipeline-lab` folder in VS Code (the folder containing `pom.xml`).
3. Open Terminal → New Terminal.
4. Run tests: `mvn test`
5. Start app: `mvn spring-boot:run`
6. Open `http://localhost:8080`.

If `mvn` is not recognized, install Apache Maven and add its `bin` folder to PATH, then restart VS Code. This ZIP does not include Maven Wrapper files.

## UI features
- Responsive dashboard and pipeline statistics
- Interactive Build → Unit Tests → API Tests → Contract Check demo
- Recent activity log and dark mode
- Test Center and CI workflow guide
- API Explorer to check health, list items, and create an item from the browser

The dashboard's Run CI Demo button is a visual simulation. Use `mvn test` to execute actual tests.

## Included tests and dependencies
- `LabServiceTest`: JUnit 5 unit tests
- `LabControllerTest`: Spring MVC tests using MockMvc
- `ApiContractTest`: verifies expected health response fields
- Pact JUnit 5 and Testcontainers dependencies are included as extension points

## GitHub Actions
`.github/workflows/ci.yml` runs `mvn clean verify` on push or pull request.

## Scope note
The supplied contract test is a lightweight response-shape assertion, not full Pact consumer/provider verification. Pact and Testcontainers dependencies are included; a real Pact provider/broker and Docker-backed database test require service-specific configuration.
