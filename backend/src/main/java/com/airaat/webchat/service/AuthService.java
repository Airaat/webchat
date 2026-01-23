package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.request.LoginRequest;
import com.airaat.webchat.domain.model.User;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {
    private final AuthenticationManager authManager;

    public User verify(LoginRequest dto) {
        try {
            Authentication authentication = authManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            dto.getUsername(),
                            dto.getPassword()
                    )
            );
            return (User) authentication.getPrincipal();
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Incorrect username or password");
        }
    }
}
