package com.airaat.webchat.controller;

import com.airaat.webchat.domain.dto.request.UserUpdate;
import com.airaat.webchat.domain.dto.response.UserResponse;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Stream;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @GetMapping("/find")
    public ResponseEntity<List<UserResponse>> findByUsername(@RequestParam String username) {
        Stream<User> users = userService.findByUsername(username).stream();
        return ResponseEntity.ok(users.map(UserResponse::from).toList());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UserUpdate dto) {
        return ResponseEntity.ok(UserResponse.from(userService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
