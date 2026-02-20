package com.airaat.webchat.domain.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageInfo {
    private String nextCursor;
    private String prevCursor;
    private Boolean hasMore;
    private Boolean hasPrevious;
    private Long totalCount;

    public static PageInfo empty() {
        return PageInfo.builder()
                .nextCursor(null)
                .prevCursor(null)
                .hasMore(false)
                .hasPrevious(false)
                .totalCount(null)
                .build();
    }
}
