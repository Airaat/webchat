package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.Message;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Long> {
    List<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Limit limit);
    Page<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);
}
