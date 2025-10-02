package com.airaat.webchat.domain.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class MuteChatRequest {
    @NotNull(message = "Enter the chat id")
    private Long chatId;

    @NotNull(message = "Fill in the until date for mute")
    @Future(message = "Incorrect date")
    private LocalDateTime untilDate;
}
