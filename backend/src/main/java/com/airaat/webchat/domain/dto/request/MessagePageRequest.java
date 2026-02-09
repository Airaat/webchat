package com.airaat.webchat.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Base64;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagePageRequest {
    private Long chatId;
    private String cursor;
    private int limit = 50;

    public static MessagePageRequest of(Long chatId) {
        return new MessagePageRequest(chatId, null, 50);
    }

    public CursorData decodeCursor() {
        if (cursor == null || cursor.isEmpty()) {
            return null;
        }

        try {
            String decoded = new String(Base64.getDecoder().decode(cursor));
            String[] parts = decoded.split("@");
            return new CursorData(
                    LocalDateTime.parse(parts[0]),
                    Long.parseLong(parts[1])
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid cursor format");
        }
    }

    public record CursorData(
            LocalDateTime timestamp,
            Long messageId
    ) {}
}
