package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.enums.MessageType;
import com.airaat.webchat.domain.model.Message;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private MessageType type;
    private String message;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime timestamp;
    private boolean edited;

    public static MessageResponse of(Message message) {
        boolean edited = message.getEditedAt() != null;

        return MessageResponse.builder()
                .type(message.getType())
                .message(message.getContent())
                .authorId(message.getAuthor().getId())
                .authorUsername(message.getAuthor().getUsername())
                .timestamp(edited ? message.getEditedAt() : message.getCreatedAt())
                .edited(edited)
                .build();
    }
}
