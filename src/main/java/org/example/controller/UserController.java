package org.example.controller;

import org.example.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
public class UserController {

    @GetMapping
    public String showUserPage(@AuthenticationPrincipal User currentUser, Model model) {
        model.addAttribute("currentUser", currentUser);
        return "user_page";
    }
}