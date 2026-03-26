package com.fixitnow.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // 1. The Front Door: This is where React will connect to the WebSocket.
        // We allow all origins (*) so your React app on localhost:3000 isn't blocked by CORS.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // SockJS provides a fallback if a browser doesn't support WebSockets
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // 2. The Mailbox: Any message sent TO the client will start with "/user" or "/topic"
        // "/user" is for private 1-on-1 chats, "/topic" is for group broadcasts.
        registry.enableSimpleBroker("/topic", "/user");
        
        // 3. The Sorting Facility: Any message sent FROM React to Spring Boot must start with "/app"
        registry.setApplicationDestinationPrefixes("/app");
        
        // 4. The Private Routing: Tells Spring Boot how to route private messages to specific users
        registry.setUserDestinationPrefix("/user");
    }
}