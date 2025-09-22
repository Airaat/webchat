package com.airaat.webchat.domain.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdate {
    @Size(min = 3, max = 50, message = "Username should be larger then 3 characters")
    private String username;

    @Size(min = 8, max = 50, message = "Minimum length of password is 8 characters")
    private String password;

    @Size(min = 8, max = 50, message = "Minimum length of password is 8 characters")
    private String confirmPassword;
    private Boolean isActive;
    private String role;

    public boolean hasUsername() {
        return username != null && !username.isEmpty();
    }

    public boolean hasPassword() {
        return password != null && !password.isEmpty();
    }

    public boolean hasIsActive() {
        return isActive != null;
    }

    public boolean hasRole() {
        return role != null && !role.isEmpty();
    }
}
