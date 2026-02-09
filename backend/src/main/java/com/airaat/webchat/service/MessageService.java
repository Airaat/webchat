package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.request.ChatMessageRequest;
import com.airaat.webchat.domain.dto.request.MessagePageRequest;
import com.airaat.webchat.domain.dto.response.MessagePageResponse;
import com.airaat.webchat.domain.dto.response.MessageResponse;
import com.airaat.webchat.domain.model.Chat;
import com.airaat.webchat.domain.model.Message;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.domain.projection.MessagePageStats;
import com.airaat.webchat.repository.MessageRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@AllArgsConstructor
public class MessageService {
    private final MessageRepository repository;

    public MessagePageResponse getMessages(MessagePageRequest request) {
        List<Message> messages;
        MessagePageRequest.CursorData cursor = request.decodeCursor();
        long chatId = request.getChatId();
        int limit = request.getLimit();

        if (cursor == null) {
            messages = repository.findLatestMessages(chatId, limit).reversed();
        } else {
            messages = repository.findMessagesBefore(
                    chatId,
                    cursor.timestamp(),
                    cursor.messageId(),
                    limit
            ).reversed();
        }

        return buildResponse(chatId, messages);
    }

    private MessagePageResponse buildResponse(Long chatId, List<Message> messages) {
        Message lastMessage = messages.getLast();
        Message firstMessage = messages.getFirst();

        String nextCursor = MessagePageResponse.createCursor(lastMessage);
        String prevCursor = MessagePageResponse.createCursor(firstMessage);

        MessagePageStats stats = repository.aggregateInfo(
                chatId,
                lastMessage.getId(),
                firstMessage.getId()
        );

        return MessagePageResponse.builder()
                .messages(messages.stream()
                        .map(MessageResponse::of)
                        .toList())
                .pageInfo(MessagePageResponse.PageInfo.builder()
                        .nextCursor(nextCursor)
                        .prevCursor(prevCursor)
                        .hasMore(stats.getHasMore())
                        .hasPrevious(stats.getHasPrev())
                        .totalCount(stats.getTotalCount())
                        .build())
                .build();
    }

    @Transactional
    public Message save(Chat chat, ChatMessageRequest dto, User author) {
        Message message = Message.builder()
                .chat(chat)
                .author(author)
                .content(dto.getContent())
                .type(dto.getType())
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(message);
    }
}
