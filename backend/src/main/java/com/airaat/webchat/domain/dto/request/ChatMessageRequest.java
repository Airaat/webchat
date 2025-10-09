package com.airaat.webchat.domain.dto.request;

import com.airaat.webchat.domain.enums.MessageType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessageRequest {
    private MessageType type;
    private String content;
    private String authorUsername;
}
