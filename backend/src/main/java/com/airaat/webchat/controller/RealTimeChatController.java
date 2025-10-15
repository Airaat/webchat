package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.ChatUpdateDTO;
import com.airaat.webchat.domain.dto.UserPresence;
import com.airaat.webchat.domain.dto.request.ChatMessageRequest;
import com.airaat.webchat.domain.dto.request.TypingRequest;
import com.airaat.webchat.domain.dto.response.ErrorResponse;
import com.airaat.webchat.domain.dto.response.MessageResponse;
import com.airaat.webchat.domain.dto.response.TypingResponse;
import com.airaat.webchat.domain.model.Chat;
import com.airaat.webchat.domain.model.Message;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.ChatService;
import com.airaat.webchat.service.MessageService;
import com.airaat.webchat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class RealTimeChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;
    private final ChatService chatService;
    private final MessageService messageService;

    @MessageMapping("/chat/{chatId}/send")
    public void sendMessage(@DestinationVariable Long chatId,
                            @Payload ChatMessageRequest request,
                            Principal principal) {
        User author = userService.getByUsername(principal.getName());
        if (!chatService.hasAccess(chatId, author)) {
            throw new SecurityException("You do not have permission to access this chat");
        }
        Chat chat = chatService.getById(chatId);

        try {
            Message message = messageService.save(chat, request, author);
            log.info("Sending message from [{}] to chat {}", request.getAuthorUsername(), chatId);
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, MessageResponse.of(message));
            sendChatUpdateToParticipants(chat, message);
        } catch (MessagingException e) {
            log.error("Error sending message from [{}] to chat {}: {}", principal.getName(), chatId, e.getMessage());
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    private void sendChatUpdateToParticipants(Chat chat, Message message) {
        for (User user : chatService.getMembers(chat)) {
            ChatUpdateDTO chatUpdate = ChatUpdateDTO.builder()
                    .id(chat.getId())
                    .lastMessage(message.getContent())
                    .lastMessageAt(message.getCreatedAt())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    user.getUsername(),
                    "/queue/notifications",
                    chatUpdate
            );
        }
    }

    @MessageMapping("/chat/{chatId}/typing")
    public void handleTyping(@DestinationVariable Long chatId,
                             @Payload TypingRequest request,
                             Principal principal) {
        User user = userService.getByUsername(principal.getName());
        if (!chatService.hasAccess(chatId, user)) {
            throw new SecurityException("You do not have permission to access this chat");
        }

        TypingResponse response = TypingResponse.builder()
                .chatId(chatId)
                .typing(request.isTyping())
                .username(user.getUsername())
                .timestamp(LocalDateTime.now())
                .build();

        try {
            messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/typing", response);
        } catch (MessagingException e) {
            log.error("Error updating typing status of user [{}] to chat {}: {}", user.getUsername(), chatId, e.getMessage());
        }
    }

    @MessageMapping("/chat/{chatId}/presence")
    public void updateUserPresence(@DestinationVariable Long chatId,
                                   @Payload UserPresence dto,
                                   Principal principal) {
        User user = userService.getByUsername(principal.getName());
        if (!chatService.hasAccess(chatId, user)) {
            throw new SecurityException("No permission to access this chat");
        }

        try {
            messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/presence", dto);
        } catch (MessagingException e) {
            log.error("Error updating presence of user [{}] to chat {}: {}", user.getUsername(), chatId, e.getMessage());
        }
    }

    @SubscribeMapping("/chat/{chatId}")
    public List<MessageResponse> subscribeToChat(@DestinationVariable Long chatId, Principal principal) {
        User user = userService.getByUsername(principal.getName());
        if (!chatService.hasAccess(chatId, user)) {
            throw new SecurityException("No permission to access this chat");
        }

        log.info("Subscribing to chat {}: {}", chatId, principal.getName());
        List<Message> recentMessages = messageService.getRecentMessages(chatId, 50);
        return recentMessages.stream()
                .map(MessageResponse::of)
                .toList();
    }

    @MessageExceptionHandler
    public void handleException(Exception exception, Principal principal) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(exception.getMessage())
                .timestamp(LocalDateTime.now())
                .username(principal.getName())
                .build();

        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", errorResponse);
    }
}
