package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.UserPresence;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@Slf4j
public class UserPresenceService {
    private final StringRedisTemplate redisTemplate;
    private final String PREFIX = "user_presence:";
    private final Duration EXPIRATION;

    public UserPresenceService(
            @NonNull StringRedisTemplate redisTemplate,
            @Value("${app.presence.ttl-seconds:60}") long ttlSeconds
    ) {
        this.redisTemplate = redisTemplate;
        this.EXPIRATION = Duration.ofSeconds(ttlSeconds);
        log.info("UserPresenceService initialized with TTL={}", ttlSeconds);
    }

    public UserPresence getStatus(long userId) {
        try {
            String key = PREFIX + userId;
            String timestampStr = redisTemplate.opsForValue().get(key);

            boolean isOnline = timestampStr != null;
            Instant timestamp = null;
            if (isOnline) {
                timestamp = Instant.ofEpochMilli(Long.parseLong(timestampStr));
            }

            return new UserPresence(userId, isOnline, timestamp);
        } catch (Exception e) {
            log.error("Failed to check presence for user {}: {}", userId, e.getMessage());
            return new UserPresence(userId, false, null);
        }
    }

    /**
     * Update user's presence with current timestamp.
     * Called on login, logout, and heartbeat.
     *
     * @param userId   the user ID
     * @param isOnline true to mark online, false to mark offline
     * @return true if status actually changed (for broadcasting)
     */
    public boolean updatePresence(Long userId, boolean isOnline) {
        String key = PREFIX + userId;
        boolean wasOnline = redisTemplate.hasKey(key);

        if (isOnline) {
            String timestamp = String.valueOf(System.currentTimeMillis());
            redisTemplate.opsForValue().set(key, timestamp, EXPIRATION);
            return !wasOnline;
        } else {
            redisTemplate.delete(key);
            return wasOnline;
        }
    }

    public void heartbeat(long userId) {
        String key = PREFIX + userId;
        String timestamp = String.valueOf(System.currentTimeMillis());
        redisTemplate.opsForValue().set(key, timestamp, EXPIRATION);
    }

    public Map<Long, UserPresence> checkStatus(@NonNull Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }

        List<Long> userIdList = new ArrayList<>(userIds);
        List<String> keys = userIdList.stream().map(id -> PREFIX + id).toList();
        List<String> timestamps = redisTemplate.opsForValue().multiGet(keys);

        if (timestamps == null) {
            return Map.of();
        }

        Map<Long, UserPresence> result = new HashMap<>();
        for (int i = 0; i < userIdList.size(); i++) {
            Long userId = userIdList.get(i);
            String timestampStr = timestamps.get(i);

            if (timestampStr != null) {
                long timestamp = Long.parseLong(timestampStr);
                result.put(userId, new UserPresence(
                        userId,
                        true,
                        Instant.ofEpochMilli(timestamp)
                ));
            } else {
                result.put(userId, new UserPresence(userId, false, null));
            }
        }

        return result;
    }
}
