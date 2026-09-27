package com.example.worsi_backend.dto;

import lombok.Getter;

@Getter
public class LoginResponse {

    private final String token;
    private final UserResponse user;

    public LoginResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }
}