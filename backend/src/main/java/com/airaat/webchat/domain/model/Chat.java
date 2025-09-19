package com.airaat.webchat.domain.model;

import com.airaat.webchat.domain.enums.ChatType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "chat")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ChatType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ChatGroup group;

    @OneToMany(
        mappedBy = "chat",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
