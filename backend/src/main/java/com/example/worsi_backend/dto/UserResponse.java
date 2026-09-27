package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Role;
import com.example.worsi_backend.Entity.User;
import lombok.Getter;

@Getter
public class UserResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final Role role;
    private final String phone;
    private final String avatarUrl;

    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.phone = user.getPhone();
        this.avatarUrl = user.getAvatarUrl();
    }
}