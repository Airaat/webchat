package com.airaat.webchat.domain.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TypingRequest {
    private boolean isTyping;
}
