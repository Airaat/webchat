package com.airaat.webchat.domain.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatUpdateDTO {
    private Long id;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
