package com.airaat.webchat.domain.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserPresence {
    private Long chatId;
    private String username;
    private boolean isOnline;
    private LocalDateTime lastSeenAt;
}
