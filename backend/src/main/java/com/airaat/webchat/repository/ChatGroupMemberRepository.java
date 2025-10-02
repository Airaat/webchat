package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.ChatGroup;
import com.airaat.webchat.domain.model.ChatGroupMember;
import com.airaat.webchat.domain.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatGroupMemberRepository extends CrudRepository<ChatGroupMember, Long> {
    Optional<ChatGroupMember> findByGroupAndUser(ChatGroup group, User user);
}
