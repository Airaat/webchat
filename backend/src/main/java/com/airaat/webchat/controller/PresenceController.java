package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.UserPresence;
import com.airaat.webchat.domain.dto.request.PresenceRequest;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.UserPresenceService;
import com.airaat.webchat.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@AllArgsConstructor
@Slf4j
public class PresenceController {
    private final UserService userService;
    private final UserPresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();

    @MessageMapping("/presence/update")
    public void updatePresence(@Payload PresenceRequest req, Principal principal) {
        User user = userService.getByUsername(principal.getName());
        boolean statusChanged = presenceService.updatePresence(user.getId(), req.isOnline());

        if (statusChanged) {
            log.info("Presence updated for user {}: {}", user.getUsername(), req.isOnline());
            broadcastPresenceChange(user);
        }
    }

    @MessageMapping("/presence/heartbeat")
    public void heartbeat(Principal principal) {
        User user = userService.getByUsername(principal.getName());
        presenceService.heartbeat(user.getId());
    }

    @MessageMapping("/presence/batch")
    public void getBatchPresence(Long[] userIds, Principal principal) {
        Map<Long, UserPresence> statuses = presenceService.checkStatus(List.of(userIds));
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/presence/batch",
                statuses
        );
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
            User user = userService.getByUsername(principal.getName());

            sessionUserMap.put(sessionId, user.getId());
            boolean wasOffline = presenceService.updatePresence(user.getId(), true);

            if (wasOffline) {
                broadcastPresenceChange(user);
            }
        }
    }

    /**
     * Handle WebSocket disconnect - automatically mark user offline.
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        Long userId = sessionUserMap.remove(sessionId);

        if (userId != null) {
            try {
                User user = userService.getById(userId);
                boolean wasOnline = presenceService.updatePresence(userId, false);

                if (wasOnline) {
                    broadcastPresenceChange(user);
                }
            } catch (Exception e) {
                log.error("Error handling disconnect for user {}: {}", userId, e.getMessage());
            }
        }
    }

    private void broadcastPresenceChange(User user) {
        UserPresence status = presenceService.getStatus(user.getId());
        Set<User> relatedUsers = userService.findRelatedUsers(user);

        for (User related : relatedUsers) {
            try {
                messagingTemplate.convertAndSendToUser(
                        related.getUsername(),
                        "/queue/presence",
                        status
                );
            } catch (MessagingException e) {
                log.error("Error updating presence of user [{}]: {}", user.getUsername(), e.getMessage());
            }
        }
    }
}
