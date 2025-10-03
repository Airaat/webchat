package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.projection.ChatView;
import com.airaat.webchat.domain.enums.ChatType;
import com.airaat.webchat.domain.enums.GroupRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatItem {
    private Long id;
    private ChatType type;
    private LocalDateTime createdAt;
    private Long groupId;
    private GroupRole groupRole;
    private LocalDateTime mutedUntil;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private String title;

    public static ChatItem from(ChatView view) {
        return ChatItem.builder()
                .id(view.getId())
                .title(view.getTitle())
                .groupId(view.getGroupId())
                .lastMessage(view.getLastMessage())
                .type(ChatType.valueOf(view.getType()))
                .groupRole(view.getRole() != null ? GroupRole.valueOf(view.getRole()) : null)
                .createdAt(view.getCreatedAt() != null ? view.getCreatedAt().toLocalDateTime() : null)
                .mutedUntil(view.getMutedUntil() != null ? view.getMutedUntil().toLocalDateTime() : null)
                .lastMessageAt(view.getLastMessageAt() != null ? view.getLastMessageAt().toLocalDateTime() : null)
                .build();
    }
}
