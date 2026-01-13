package org.example.service;

import org.example.model.User;

import java.util.List;
import java.util.Set;

public interface UserService {
    List<User> findAllUsers();
    User findUserById(Long id);
    User findUserByEmail(String email);
    User saveUser(User user);
    User updateUser(Long id, User user);
    void deleteUserById(Long id);
    boolean existsByEmail(String email);
    User createUserWithRoles(User user, Set<String> roleNames);
    User updateUserWithRoles(Long id, User user, Set<String> roleNames);
}