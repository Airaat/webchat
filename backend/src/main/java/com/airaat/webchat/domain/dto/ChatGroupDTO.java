package com.airaat.webchat.domain.dto;

import com.airaat.webchat.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ChatGroupDTO {
    String name;
    String description;
    User creator;
    List<User> members;
}
