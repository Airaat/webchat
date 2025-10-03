package com.airaat.webchat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chat_participant", indexes = {
        @Index(name = "idx_chat_participant_chat_id", columnList = "chat_id"),
        @Index(name = "idx_chat_participant_user_id", columnList = "user_id"),
        @Index(name = "idx_chat_participant_unique", columnList = "user_id, chat_id", unique = true),
})
public class ChatParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil;
}
