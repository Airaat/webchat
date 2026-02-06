package com.airaat.webchat.service;

import com.airaat.webchat.config.property.JwtProperties;
import com.airaat.webchat.domain.dto.UserPayload;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
@AllArgsConstructor
public class JwtService {
    private final JwtProperties properties;

    public String generateAccessToken(UserPayload userPayload) {
        return buildToken(userPayload, properties.getAccessSecret(), properties.getAccessExpirationMin());
    }

    public String generateRefreshToken(UserPayload userPayload) {
        return buildToken(userPayload, properties.getRefreshSecret(), properties.getRefreshExpirationMin());
    }

    public boolean validateAccessToken(String token) {
        return token != null && isTokenValid(token, properties.getAccessSecret());
    }

    public boolean validateRefreshToken(String token) {
        return token != null && isTokenValid(token, properties.getRefreshSecret());
    }

    public Long extractUserId(String refreshToken) {
        Claims claims = parseToken(refreshToken, properties.getRefreshSecret());
        return Long.parseLong(claims.getSubject());
    }

    public String extractUsername(String accessToken) {
        Claims claims = parseToken(accessToken, properties.getAccessSecret());
        return claims.get("username", String.class);
    }

    private String buildToken(UserPayload payload, String secret, Integer expirationMin) {
        return Jwts.builder()
                .subject(payload.getUserId())
                .claim("username", payload.getUsername())
                .claim("role", payload.getRole())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(expirationMin, ChronoUnit.MINUTES)))
                .signWith(getKey(secret))
                .compact();
    }

    private Claims parseToken(String token, String secret) {
        return Jwts.parser()
                .verifyWith(getKey(secret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenValid(String token, String secret) {
        Claims claims = parseToken(token, secret);
        Date expiration = claims.getExpiration();
        return !expiration.before(new Date());
    }

    private SecretKey getKey(String key) {
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public int getRefreshTokenExpirySec() {
        return properties.getRefreshExpirationMin() * 60;
    }
}
