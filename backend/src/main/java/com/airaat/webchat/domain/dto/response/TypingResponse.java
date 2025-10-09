package com.airaat.webchat.domain.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TypingResponse {
    private Long chatId;
    private String username;
    private boolean typing;
    private LocalDateTime timestamp;
}
