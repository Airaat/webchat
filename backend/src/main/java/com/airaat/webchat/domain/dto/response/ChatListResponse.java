package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ChatListResponse {
    private List<ChatItem> chats;
    private int pageNumber;
    private long totalItems;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

    public static ChatListResponse from(Page<ChatItem> page, User current) {
        return ChatListResponse.builder()
                .chats(page.getContent())
                .pageNumber(page.getNumber())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
