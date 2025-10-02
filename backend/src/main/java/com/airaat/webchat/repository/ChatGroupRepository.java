package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.ChatGroup;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatGroupRepository extends CrudRepository<ChatGroup, Long> {
}
