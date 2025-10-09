package com.airaat.webchat.domain.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {
    private String message;
    private String username;
    private LocalDateTime timestamp;
}
