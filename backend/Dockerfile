# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src
# Build the jar file, skipping tests for faster deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built jar from the build stage (this handles any jar name automatically)
COPY --from=build /app/target/*.jar app.jar

# Expose the port Render uses
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]