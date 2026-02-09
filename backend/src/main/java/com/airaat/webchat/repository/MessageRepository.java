package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.Message;
import com.airaat.webchat.domain.projection.MessagePageStats;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Long> {
    @Query(value = """
            SELECT *
            FROM message
            WHERE chat_id = :chatId
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Message> findLatestMessages(Long chatId, int limit);

    @Query(value = """
            SELECT *
            FROM message
            WHERE chat_id = :chatId
              AND (created_at, id) < (:cursorDate, :cursorId)
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Message> findMessagesBefore(Long chatId, LocalDateTime cursorDate, Long cursorId, int limit);

    @Query(value = """
            SELECT COUNT(*)                      AS total_count,
                   BOOL_OR(id > :lastMessageId)  AS has_more,
                   BOOL_OR(id < :firstMessageId) AS has_prev
            FROM message
            WHERE chat_id = :chatId
            """, nativeQuery = true)
    MessagePageStats aggregateInfo(Long chatId, Long lastMessageId, Long firstMessageId);
}