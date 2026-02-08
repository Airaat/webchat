package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.enums.ChatType;
import com.airaat.webchat.domain.enums.GroupRole;
import com.airaat.webchat.domain.model.Chat;
import com.airaat.webchat.domain.model.ChatGroup;
import com.airaat.webchat.domain.projection.ChatView;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatItem {
    private Long id;
    private ChatType type;
    private Long userId;
    private Boolean isOnline;
    private GroupRole groupRole;
    private LocalDateTime mutedUntil;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private String title;
    /**
     * TODO:
     * private Integer unreadCount; // idk how do we count this
     * */

    public static ChatItem from(ChatView view) {
        LocalDateTime lastMessageAt = view.getLastMessageAt() != null
                ? view.getLastMessageAt().toLocalDateTime()
                : view.getCreatedAt().toLocalDateTime();

        return ChatItem.builder()
                .id(view.getId())
                .title(view.getTitle())
                .lastMessage(view.getLastMessage())
                .lastMessageAt(lastMessageAt)
                .type(ChatType.valueOf(view.getType()))
                .groupRole(view.getRole() != null ? GroupRole.valueOf(view.getRole()) : null)
                .mutedUntil(view.getMutedUntil() != null ? view.getMutedUntil().toLocalDateTime() : null)
                .userId(view.getUserId())
                .build();
    }

    public static ChatItem from(Chat chat) {
        ChatGroup group = chat.getGroup();

        return ChatItem.builder()
                .id(chat.getId())
                .type(chat.getType())
                .lastMessageAt(chat.getCreatedAt())
                .title(group != null ? group.getName() : null)
                .groupRole(group != null ? GroupRole.OWNER : null)
                .mutedUntil(null)
                .lastMessage(null)
                .userId(null)
                .build();
    }
}
