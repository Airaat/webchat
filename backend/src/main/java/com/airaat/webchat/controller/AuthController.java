package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.UserPayload;
import com.airaat.webchat.domain.dto.request.LoginRequest;
import com.airaat.webchat.domain.dto.request.SignupRequest;
import com.airaat.webchat.domain.dto.response.AuthResponse;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.AuthService;
import com.airaat.webchat.service.JwtService;
import com.airaat.webchat.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserService userService;
    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest dto, HttpServletResponse response) {
        User user = authService.verify(dto);
        String accessToken = authorize(user, response);
        return ResponseEntity.ok(new AuthResponse(accessToken));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest dto, HttpServletResponse response) {
        User user = userService.create(dto);
        String accessToken = authorize(user, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(accessToken));
    }

    private String authorize(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(UserPayload.of(user));
        String refreshToken = jwtService.generateRefreshToken(UserPayload.of(user));

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // TODO: change value when enabling https
                .sameSite("strict")
                .path("/api/v1/auth/refresh")
                .maxAge(jwtService.getRefreshTokenExpirySec())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        userService.updateLastLogin(user);

        return accessToken;
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refreshToken")) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null || !jwtService.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = jwtService.extractUserId(refreshToken);
        User user = userService.getById(userId);
        userService.updateLastLogin(user);

        String accessToken = jwtService.generateAccessToken(UserPayload.of(user));
        return ResponseEntity.status(HttpStatus.OK).body(new AuthResponse(accessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false) // TODO: change value when enabling https
                .sameSite("strict")
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return ResponseEntity.ok().build();
    }
}
