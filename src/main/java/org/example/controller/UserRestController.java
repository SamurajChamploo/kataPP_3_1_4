package org.example.controller;

import org.example.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserRestController {

    @GetMapping("/info")
    public User getCurrentUserInfo(@AuthenticationPrincipal User currentUser) {
        return currentUser;
    }
}