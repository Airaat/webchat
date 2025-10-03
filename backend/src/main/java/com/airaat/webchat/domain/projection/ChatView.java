package com.airaat.webchat.domain.projection;

import java.sql.Timestamp;

public interface ChatView {
    Long getId();
    String getType();
    Timestamp getCreatedAt();
    Long getGroupId();
    String getRole();
    Timestamp getMutedUntil();
    String getLastMessage();
    Timestamp getLastMessageAt();
    String getTitle();
}
