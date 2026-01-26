package com.airaat.webchat.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSearchResponse {
    private List<ChatItem> chats;
    private List<UserResponse> users;
}
