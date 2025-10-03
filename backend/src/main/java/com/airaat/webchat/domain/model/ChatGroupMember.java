package com.airaat.webchat.domain.model;

import com.airaat.webchat.domain.enums.GroupRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chat_group_member", indexes = {
        @Index(name = "idx_chat_group_member_user_id", columnList = "user_id"),
        @Index(name = "idx_chat_group_member_group_id", columnList = "group_id"),
        @Index(name = "idx_chat_group_member_unique", columnList = "user_id,group_id", unique = true),
})
public class ChatGroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ChatGroup group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private GroupRole role = GroupRole.MEMBER;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
