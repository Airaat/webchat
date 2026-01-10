package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.ChatGroupDTO;
import com.airaat.webchat.domain.dto.request.CreateChatRequest;
import com.airaat.webchat.domain.dto.request.MuteChatRequest;
import com.airaat.webchat.domain.dto.response.ChatItem;
import com.airaat.webchat.domain.dto.response.ChatListResponse;
import com.airaat.webchat.domain.dto.response.PaginatedMessages;
import com.airaat.webchat.domain.enums.ChatType;
import com.airaat.webchat.domain.model.Chat;
import com.airaat.webchat.domain.model.Message;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.exception.ValidationError;
import com.airaat.webchat.service.ChatService;
import com.airaat.webchat.service.MessageService;
import com.airaat.webchat.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/chats")
class ChatController {
    private final UserService userService;
    private final ChatService chatService;
    private final MessageService messageService;

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
    public ResponseEntity<ChatItem> create(@RequestBody @Valid CreateChatRequest request) {
        User current = userService.current();
        ChatItem chatItem;

        if (request.getChatType() == ChatType.PRIVATE) {
            User target = userService.getById(request.getUserIds().getFirst());
            Chat chat = chatService.createPrivate(List.of(current, target));
            chatItem = ChatItem.from(chat);
            chatItem.setTitle(target.getUsername());
        } else {
            ChatGroupDTO dto = ChatGroupDTO.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .creator(current)
                    .members(userService.getByIds(request.getUserIds()))
                    .build();

            Chat chat = chatService.createGroup(dto);
            chatItem = ChatItem.from(chat);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(chatItem);
    }

    @GetMapping("/{chatId}/messages")
    public PaginatedMessages chatHistory(@PathVariable Long chatId,
                                         @RequestParam(defaultValue = "0") int p,
                                         @RequestParam(defaultValue = "50") int s,
                                         Principal principal) {
        User user = userService.getByUsername(principal.getName());
        if (!chatService.hasAccess(chatId, user)) {
            throw new SecurityException("You do not have permission to access chat history");
        }

        if (p < 0 || s < 0) {
            String purpose = p < 0 ? "number" : "size";
            throw new ValidationError("Invalid parameter: page " + purpose);
        }

        Page<Message> page = messageService.getRecentMessages(chatId, PageRequest.of(p, s));
        return PaginatedMessages.of(page);
    }

    @PostMapping("/mute")
    public ResponseEntity<?> mute(@RequestBody @Valid MuteChatRequest request) {
        chatService.mute(request, userService.current());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/leave/{id}")
    public ResponseEntity<?> leave(@PathVariable Long id) {
        User current = userService.current();
        chatService.leave(id, current);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User current = userService.current();
        chatService.delete(id, current);
        return ResponseEntity.noContent().build();
    }
}
