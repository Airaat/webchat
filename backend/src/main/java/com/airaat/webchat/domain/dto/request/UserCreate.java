package com.airaat.webchat.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreate {
    @NotBlank(message = "Fill the username")
    @Size(min = 5, max = 50, message = "Username should be larger then 5 characters")
    private String username;

    @NotBlank(message = "Fill the password")
    @Size(min = 8, max = 50, message = "Minimum length of password is 8 characters")
    private String password;

    @NotBlank(message = "Fill the password")
    @Size(min = 8, max = 50, message = "Minimum length of password is 8 characters")
    private String confirmPassword;
}
