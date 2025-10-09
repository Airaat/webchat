package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.enums.MessageType;
import com.airaat.webchat.domain.model.Message;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private MessageType type;
    private String content;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime timestamp;
    private boolean edited;

    public static MessageResponse of(Message message) {
        boolean edited = message.getEditedAt() != null;

        return MessageResponse.builder()
                .id(message.getId())
                .type(message.getType())
                .content(message.getContent())
                .authorId(message.getAuthor().getId())
                .authorUsername(message.getAuthor().getUsername())
                .timestamp(edited ? message.getEditedAt() : message.getCreatedAt())
                .edited(edited)
                .build();
    }
}
