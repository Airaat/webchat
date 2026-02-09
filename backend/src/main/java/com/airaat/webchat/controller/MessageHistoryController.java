package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.request.MessagePageRequest;
import com.airaat.webchat.domain.dto.response.MessagePageResponse;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.ChatService;
import com.airaat.webchat.service.MessageService;
import com.airaat.webchat.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/chats/{chatId}/messages")
public class MessageHistoryController {
    private final UserService userService;
    private final ChatService chatService;
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<MessagePageResponse> chatHistory(
            @PathVariable Long chatId,
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false, defaultValue = "50") int limit,
            Principal principal
    ) {
        User user = userService.getByUsername(principal.getName());
        if (!chatService.hasAccess(chatId, user)) {
            throw new SecurityException("You do not have permission to access chat history");
        }

        final int lowerBound = 20;
        final int upperBound = 50;
        final int finalLimit = Math.min(limit > 0 ? limit : lowerBound, upperBound);

        MessagePageRequest request = MessagePageRequest.builder()
                .chatId(chatId)
                .cursor(cursor)
                .limit(finalLimit)
                .build();

        return ResponseEntity.ok(messageService.getMessages(request));
    }
}
