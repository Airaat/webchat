package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Base64;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class MessagePageResponse {
    private List<MessageResponse> messages;
    private PageInfo pageInfo;

    @Data
    @Builder
    public static class PageInfo{
        private String nextCursor;
        private String prevCursor;
        private Boolean hasMore;
        private Boolean hasPrevious;
        private Long totalCount;
    }

    public static String createCursor(Message message) {
        if (message == null) return null;

        String cursorData = message.getCreatedAt() + "@" + message.getId();
        return Base64.getEncoder().encodeToString(cursorData.getBytes());
    }
}
