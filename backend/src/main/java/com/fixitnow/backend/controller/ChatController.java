package com.fixitnow.backend.controller;

import com.fixitnow.backend.entity.Message;
import com.fixitnow.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.entity.User;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // This is the tool that pushes messages to users

    @Autowired
    private MessageRepository messageRepository;

    // ─── 1. REAL-TIME WEBSOCKET ROUTER ───────────────────────────────────────
    // React will send messages to "/app/chat"
    @MessageMapping("/chat")
    public void processMessage(@Payload Message chatMessage) {
            
            // 1. Save the message to the MySQL database so it's never lost
            Message savedMessage = messageRepository.save(chatMessage);

            // 🔥 THE FIX: Use a direct topic path instead of the strict User routing
            messagingTemplate.convertAndSend(
                    "/topic/messages/" + savedMessage.getReceiverId(), 
                    savedMessage
            );
    }

    // ─── 2. HTTP ENDPOINT FOR CHAT HISTORY ───────────────────────────────────
    // React will call this when the chat page first loads
    @GetMapping("/api/messages/{user1Id}/{user2Id}")
    public List<Message> getChatHistory(
            @PathVariable Long user1Id, 
            @PathVariable Long user2Id) {
        
        return messageRepository.findChatHistory(user1Id, user2Id);
    }

    @Autowired
        private UserRepository userRepository;

    // ─── 3. HTTP ENDPOINT TO GET USER NAMES FOR THE SIDEBAR ──────────────────
    @GetMapping("/api/users/{id}")
    public Map<String, Object> getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("role", user.getRole().name());
        return response;
    }
}