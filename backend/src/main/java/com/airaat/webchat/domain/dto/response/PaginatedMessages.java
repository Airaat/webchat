package com.airaat.webchat.domain.dto.response;

import com.airaat.webchat.domain.model.Message;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Stream;

@Data
@Builder
public class PaginatedMessages {
    private List<MessageResponse> content;
    private int totalPages;
    private long totalElements;
    private int size;
    private int number;
    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;

    public static PaginatedMessages of(Page<Message> page) {
        Stream<Message> content = page.getContent().reversed().stream();

        return PaginatedMessages.builder()
                .content(content.map(MessageResponse::of).toList())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .size(page.getSize())
                .number(page.getNumber())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
