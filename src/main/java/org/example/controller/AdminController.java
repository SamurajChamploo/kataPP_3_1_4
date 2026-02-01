package org.example.controller;

import org.example.model.User;
import org.example.service.UserService;
import org.example.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String showAdminPanel(@AuthenticationPrincipal User currentUser, Model model) {
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("allUsers", userService.findAllUsers());
        model.addAttribute("allRoles", roleService.findAllRoles());
        model.addAttribute("newUser", new User());
        return "admin_panel";
    }

    @PostMapping("/users")
    public String createUser(@ModelAttribute("user") User user,
                             @RequestParam(value = "selectedRoles", required = false) Set<String> selectedRoles) {
        userService.createUser(user, selectedRoles);
        return "redirect:/admin";
    }

    @GetMapping("/users/{id}")
    public String getUserById(@PathVariable Long id, Model model) {
        User user = userService.findUserById(id);
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleService.findAllRoles());
        return "admin_panel :: #editUserModal";
    }

    @PostMapping("/users/{id}")
    public String updateUser(@PathVariable Long id,
                             @ModelAttribute("user") User user,
                             @RequestParam(value = "selectedRoles", required = false) Set<String> selectedRoles) {
        userService.updateUser(id, user, selectedRoles);
        return "redirect:/admin";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return "redirect:/admin";
    }
}
