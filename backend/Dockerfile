FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw && ./mvnw clean package

EXPOSE 8080

CMD ["java", "-jar", "target/*.jar"]
