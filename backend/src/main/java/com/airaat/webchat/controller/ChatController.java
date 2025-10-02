package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.response.ChatItem;
import com.airaat.webchat.domain.dto.response.ChatListResponse;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.ChatService;
import com.airaat.webchat.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/chats")
class ChatController {
    private final UserService userService;
    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<ChatListResponse> chats(@RequestParam(defaultValue = "0", required = false) Integer page) {
        final int pageNumber = Integer.max(page, 0);
        User current = userService.current();
        Page<ChatItem> chats = chatService.getAllForUser(current, pageNumber);
        return ResponseEntity.ok(ChatListResponse.from(chats, current));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatItem> getChat(@PathVariable Long id) {
        User current = userService.current();
        ChatItem chat = chatService.getByIdForUser(id, current);
        return ResponseEntity.ok(chat);
    }

    @PostMapping
    public ResponseEntity<?> create() {
        return null;
    }

    @PostMapping("/mute")
    public ResponseEntity<?> mute() {
        return null;
    }

    @DeleteMapping
    public ResponseEntity<?> delete() {
        return null;
    }
}
