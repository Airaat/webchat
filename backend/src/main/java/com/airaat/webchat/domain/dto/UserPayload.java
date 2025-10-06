package com.airaat.webchat.domain.dto;

import com.airaat.webchat.domain.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserPayload {
    private String userId;
    private String username;
    private String role;

    public static UserPayload of(User user) {
        return UserPayload.builder()
                .userId(user.getId().toString())
                .username(user.getUsername())
                .role(user.getGlobalRole().name())
                .build();
    }
}
