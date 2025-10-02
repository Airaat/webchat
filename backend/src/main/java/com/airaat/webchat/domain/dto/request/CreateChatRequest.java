package com.airaat.webchat.domain.dto.request;

import com.airaat.webchat.domain.enums.ChatType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class CreateChatRequest {
    @Size(min = 1, max = 50, message = "Enter group chat name")
    private String name;

    @Size(min = 1, max = 100, message = "Enter chat description")
    private String description;

    @NotNull
    private ChatType chatType;

    @NotEmpty
    private List<Long> userIds;
}
