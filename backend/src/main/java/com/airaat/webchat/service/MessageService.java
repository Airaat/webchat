package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.request.ChatMessageRequest;
import com.airaat.webchat.domain.model.Message;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.repository.MessageRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@AllArgsConstructor
public class MessageService {
    private final MessageRepository repository;

    public List<Message> getRecentMessages(Long chatId, int number) {
        return repository.findByChatIdOrderByCreatedAtDesc(chatId, Limit.of(number));
    }

    public Page<Message> getRecentMessages(Long chatId, Pageable pageable) {
        return repository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
    }

    @Transactional
    public Message save(ChatMessageRequest dto, User author) {
        Message message = Message.builder()
                .author(author)
                .content(dto.getContent())
                .type(dto.getType())
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(message);
    }
}
