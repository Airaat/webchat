package com.airaat.webchat.config.property;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "redis")
public class RedisProperties {
    private String username;
    private String hostName;
    private int port;
    private String password;
}
