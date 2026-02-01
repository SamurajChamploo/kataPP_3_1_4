package org.example.controller;

import org.example.model.User;
import org.example.service.UserService;
import org.example.service.RoleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final UserService userService;
    private final RoleService roleService;

    public AdminRestController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    // Получить всех пользователей
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.findAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("roles", roleService.findAllRoles());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting users: " + e.getMessage());
        }
    }

    // Получить пользователя по ID
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with id: " + id);
        }
    }

    // Создать пользователя
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserRequest request) {
        try {
            User createdUser = userService.createUser(request.getUser(), request.getSelectedRoles());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating user: " + e.getMessage());
        }
    }

    // Обновить пользователя
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        try {
            User updatedUser = userService.updateUser(id, request.getUser(), request.getSelectedRoles());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating user: " + e.getMessage());
        }
    }

    // Удалить пользователя
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUserById(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting user: " + e.getMessage());
        }
    }

    // Получить все роли
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            return ResponseEntity.ok(roleService.findAllRoles());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting roles: " + e.getMessage());
        }
    }

    // DTO класс для запросов
    public static class UserRequest {
        private User user;
        private Set<String> selectedRoles;

        // геттеры и сеттеры
        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }
        public Set<String> getSelectedRoles() { return selectedRoles; }
        public void setSelectedRoles(Set<String> selectedRoles) { this.selectedRoles = selectedRoles; }
    }
}