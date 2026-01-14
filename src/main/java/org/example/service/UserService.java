package org.example.service;

import org.example.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Set;

public interface UserService extends UserDetailsService {
    List<User> findAllUsers();
    User findUserById(Long id);
    User findUserByEmail(String email);
    User createUser(User user, Set<String> roleNames);
    User updateUser(Long id, User user, Set<String> roleNames);
    void deleteUserById(Long id);
    boolean existsByEmail(String email);
}