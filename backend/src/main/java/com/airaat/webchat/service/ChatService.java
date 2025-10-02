package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.response.ChatItem;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.repository.ChatRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ChatService {
    private final ChatRepository repository;

    public ChatItem getByIdForUser(Long id, User user) {
        return repository.findByIdForUser(id, user.getId()).orElseThrow(
                () -> new EntityNotFoundException("Chat with id " + id + " not found"));
    }

    public Page<ChatItem> getAllForUser(User user, int num) {
        final int size = 50;
        Pageable page = PageRequest.of(num, size, Sort.Direction.DESC, "last_message_at", "created_at");
        return repository.findAllForUser(user.getId(), page);
    }
}
