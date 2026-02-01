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

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
            List<User> users = userService.findAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("roles", roleService.findAllRoles());
            return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
            User user = userService.findUserById(id);
            return ResponseEntity.ok(user);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserRequest request) {
            User createdUser = userService.createUser(request.getUser(), request.getSelectedRoles());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
            User updatedUser = userService.updateUser(id, request.getUser(), request.getSelectedRoles());
            return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
            userService.deleteUserById(id);
            return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        return ResponseEntity.ok(roleService.findAllRoles());

    }
    public static class UserRequest {
        private User user;
        private Set<String> selectedRoles;

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }
        public Set<String> getSelectedRoles() { return selectedRoles; }
        public void setSelectedRoles(Set<String> selectedRoles) { this.selectedRoles = selectedRoles; }
    }
}