package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.enums.ChatType;
import lombok.Data;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
public class ChatItem {
    private Long id;
    private String type;
    private LocalDateTime createdAt;
    private Long groupId;
    private LocalDateTime mutedUntil;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private String title;

    // TODO: this casts indicates the need to separate dto from the projection
    public ChatItem(Long id,
                    String type,
                    Timestamp createdAt,
                    Long groupId,
                    Timestamp mutedUntil,
                    String lastMessage,
                    Timestamp lastMessageAt,
                    String title) {
        this.id = id;
        this.type = type;
        this.createdAt = createdAt != null ? createdAt.toLocalDateTime() : null;
        this.groupId = groupId;
        this.mutedUntil = mutedUntil != null ? mutedUntil.toLocalDateTime() : null;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt != null ? lastMessageAt.toLocalDateTime() : null;
        this.title = title;
    }

    public ChatType getChatType() {
        return ChatType.valueOf(type);
    }
}
