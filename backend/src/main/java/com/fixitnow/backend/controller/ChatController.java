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
import com.fixitnow.backend.entity.Role;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // This is the tool that pushes messages to users

    @Autowired
    private MessageRepository messageRepository;

    // ─── 1. REAL-TIME WEBSOCKET ROUTER ───────────────────────────────────────
    // React will send messages to "/app/chat"
    @MessageMapping("/chat")
    public void processMessage(@Payload Message chatMessage) {
            // Save once; for support chat we fan out delivery without duplicating DB rows.
            Message savedMessage = messageRepository.save(chatMessage);

            Set<Long> targets = new HashSet<>();
            targets.add(savedMessage.getReceiverId());

            User receiver = userRepository.findById(savedMessage.getReceiverId()).orElse(null);
            User sender = userRepository.findById(savedMessage.getSenderId()).orElse(null);

            // If customer/provider messages admin support, deliver to all admins.
            if (receiver != null && receiver.getRole() == Role.ADMIN) {
                userRepository.findByRole(Role.ADMIN).forEach(admin -> targets.add(admin.getId()));
            }

            // If an admin replies, keep every admin inbox in sync.
            if (sender != null && sender.getRole() == Role.ADMIN) {
                userRepository.findByRole(Role.ADMIN).forEach(admin -> targets.add(admin.getId()));
            }

            for (Long targetId : targets) {
                messagingTemplate.convertAndSend("/topic/messages/" + targetId, savedMessage);
            }
    }

    // ─── 2. HTTP ENDPOINT FOR CHAT HISTORY ───────────────────────────────────
    // React will call this when the chat page first loads
    @GetMapping("/api/messages/{user1Id}/{user2Id}")
    public List<Message> getChatHistory(
            @PathVariable Long user1Id, 
            @PathVariable Long user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Admin support history is shared across all admin accounts.
        if (user1.getRole() == Role.ADMIN && user2.getRole() != Role.ADMIN) {
            List<Long> adminIds = userRepository.findByRole(Role.ADMIN).stream().map(User::getId).collect(Collectors.toList());
            return messageRepository.findChatHistoryWithAnyAdmin(user2Id, adminIds);
        }

        if (user2.getRole() == Role.ADMIN && user1.getRole() != Role.ADMIN) {
            List<Long> adminIds = userRepository.findByRole(Role.ADMIN).stream().map(User::getId).collect(Collectors.toList());
            return messageRepository.findChatHistoryWithAnyAdmin(user1Id, adminIds);
        }

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

    @GetMapping("/api/users/admin-support")
    public Map<String, Object> getAdminSupportUser() {
        User adminUser = userRepository.findFirstByRole(Role.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin support user not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", adminUser.getId());
        response.put("name", adminUser.getName());
        response.put("role", adminUser.getRole().name());
        return response;
    }
}