package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.request.LoginRequest;
import com.airaat.webchat.domain.dto.request.SignupRequest;
import com.airaat.webchat.domain.dto.response.AuthResponse;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.AuthService;
import com.airaat.webchat.service.JwtService;
import com.airaat.webchat.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserService userService;
    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest dto) {
        UserDetails user = authService.verify(dto);
        String jwt = jwtService.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest dto) {
        User user = userService.create(dto);
        String jwt = jwtService.generateToken(user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(jwt));
    }
}
