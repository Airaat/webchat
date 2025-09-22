package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.enums.GlobalRole;
import com.airaat.webchat.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private boolean isActive;
    private GlobalRole role;
    private LocalDateTime lastLoginAt;

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.isActive(),
                user.getGlobalRole(),
                user.getLastLoginAt()
        );
    }
}
