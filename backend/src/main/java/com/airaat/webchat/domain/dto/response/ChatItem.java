package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.enums.ChatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ChatItem {
    private Long id;
    private String type;
    private LocalDateTime createdAt;
    private Long groupId;
    private LocalDateTime mutedUntil;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private String title;

    public ChatType getChatType() {
        return ChatType.valueOf(type);
    }
}
