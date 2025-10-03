package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.ChatGroupDTO;
import com.airaat.webchat.domain.dto.request.MuteChatRequest;
import com.airaat.webchat.domain.dto.response.ChatItem;
import com.airaat.webchat.domain.enums.ChatType;
import com.airaat.webchat.domain.enums.GroupRole;
import com.airaat.webchat.domain.model.*;
import com.airaat.webchat.exception.NoAccessException;
import com.airaat.webchat.exception.ValidationError;
import com.airaat.webchat.repository.ChatGroupMemberRepository;
import com.airaat.webchat.repository.ChatGroupRepository;
import com.airaat.webchat.repository.ChatParticipantRepository;
import com.airaat.webchat.repository.ChatRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class ChatService {
    private final ChatRepository repository;
    private final ChatParticipantRepository participantRepository;
    private final ChatGroupRepository groupRepository;
    private final ChatGroupMemberRepository groupMemberRepository;

    public ChatItem getByIdForUser(Long id, User user) {
        return repository.findByIdForUser(id, user.getId()).orElseThrow(
                () -> new EntityNotFoundException("Chat with id " + id + " not found"));
    }

    public Page<ChatItem> getAllForUser(User user, int num) {
        final int size = 50;
        Pageable page = PageRequest.of(num, size, Sort.Direction.DESC, "last_message_at", "created_at");
        return repository.findAllForUser(user.getId(), page);
    }

    @Transactional
    public void createPrivate(List<User> users) {
        // TODO: we need to separate validation logic from services
        if (users.isEmpty()) {
            throw new ValidationError("User list is empty");
        }

        if (users.size() != 2) {
            throw new ValidationError("Incorrect number of users for private chat");
        }

        if (participantRepository.existsPrivateChatBetweenUsers(users.get(0).getId(), users.get(1).getId())) {
            throw new ValidationError("There is already a private chat for these users.");
        }

        Chat chat = new Chat();
        chat.setType(ChatType.PRIVATE);
        repository.save(chat);

        for (User user : users) {
            ChatParticipant member = new ChatParticipant();
            member.setChat(chat);
            member.setUser(user);
            participantRepository.save(member);
        }
    }

    @Transactional
    public void createGroup(ChatGroupDTO dto) {
        if (dto.getMembers().isEmpty()) {
            // TODO: get only unique users after that check
            throw new ValidationError("User list is empty");
        }

        User creator = dto.getCreator();

        ChatGroup group = new ChatGroup();
        group.setName(dto.getName());
        group.setCreatedBy(creator);
        groupRepository.save(group);

        List<User> members = dto.getMembers();
        members.add(creator);
        members.forEach(user -> {
            ChatGroupMember member = new ChatGroupMember();
            member.setGroup(group);
            member.setUser(user);
            member.setRole(Objects.equals(creator, user) ? GroupRole.OWNER : GroupRole.MEMBER);
            groupMemberRepository.save(member);
        });

        Chat chat = new Chat();
        chat.setType(ChatType.GROUP);
        chat.setGroup(group);
        repository.save(chat);

    }

    @Transactional
    public void mute(MuteChatRequest dto, User user) {
        // TODO: unmute?
        Chat chat = getOrNotFound(dto.getChatId(), user.getId());
//        chat.setMutedUntil(dto.getUntilDate());
        repository.save(chat);
    }

    @Transactional
    public void leave(Long id, User user) {
        Chat chat = getOrNotFound(id, user.getId());
        if (chat.getType() != ChatType.GROUP) {
            throw new ValidationError("Chat with id " + id + " not available for leaving");
        }

        ChatGroup group = chat.getGroup();
        ChatGroupMember member = groupMemberRepository.findByGroupAndUser(group, user).orElseThrow(
                () -> new EntityNotFoundException("User is not member of group: " + group.getName()));

        //TODO: override the OWNER role if the departing user was the owner
        groupMemberRepository.delete(member);
    }

    @Transactional
    public void delete(Long id, User user) {
        Chat chat = getOrNotFound(id, user.getId());

        if (chat.getType() == ChatType.GROUP) {
            ChatGroup group = chat.getGroup();
            ChatGroupMember member = groupMemberRepository.findByGroupAndUser(group, user).orElseThrow(
                    () -> new EntityNotFoundException("User is not member of group: " + group.getName()));

            if (member.getRole() != GroupRole.OWNER) {
                throw new NoAccessException("User is not owner of group: " + group.getName());
            }
        }

        repository.delete(chat);
    }

    private Chat getOrNotFound(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId).orElseThrow(
                () -> new EntityNotFoundException("Chat with id " + id + " not found"));
    }
}
