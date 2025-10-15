package com.airaat.webchat.domain.dto;

import com.airaat.webchat.domain.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatNotification {
    private Long chatId;
    private NotificationType action;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
