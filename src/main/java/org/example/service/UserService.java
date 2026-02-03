package org.example.service;

import org.example.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Map;

public interface UserService extends UserDetailsService {
    List<User> findAllUsers();
    User findUserById(Long id);
    User findUserByEmail(String email);
    User createUserFromMap(Map<String, Object> userData);
    User updateUserFromMap(Long id, Map<String, Object> userData);
    void deleteUserById(Long id);
    boolean existsByEmail(String email);
}