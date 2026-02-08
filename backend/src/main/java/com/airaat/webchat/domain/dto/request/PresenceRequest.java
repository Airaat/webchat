package com.airaat.webchat.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PresenceRequest {
    private boolean isOnline;
}
