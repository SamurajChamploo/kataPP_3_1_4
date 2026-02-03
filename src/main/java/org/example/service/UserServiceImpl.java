package org.example.service;

import org.example.model.Role;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleService roleService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    @Transactional
    public User createUserFromMap(Map<String, Object> userData) {
        validateUserData(userData, true);

        String email = (String) userData.get("email");
        if (existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        User user = new User();
        user.setFirstName((String) userData.get("firstName"));
        user.setLastName((String) userData.get("lastName"));
        user.setAge(userData.get("age") != null ?
                Integer.parseInt(userData.get("age").toString()) : 0);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode((String) userData.get("password")));

        setUserRolesFromMap(user, userData);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserFromMap(Long id, Map<String, Object> userData) {
        validateUserData(userData, false);

        User existingUser = findUserById(id);

        if (userData.containsKey("firstName")) {
            existingUser.setFirstName((String) userData.get("firstName"));
        }
        if (userData.containsKey("lastName")) {
            existingUser.setLastName((String) userData.get("lastName"));
        }
        if (userData.containsKey("age")) {
            existingUser.setAge(Integer.parseInt(userData.get("age").toString()));
        }

        if (userData.containsKey("email")) {
            String newEmail = (String) userData.get("email");
            if (!newEmail.equals(existingUser.getEmail()) && existsByEmail(newEmail)) {
                throw new RuntimeException("Email " + newEmail + " is already in use");
            }
            existingUser.setEmail(newEmail);
        }

        if (userData.containsKey("password") &&
                userData.get("password") != null &&
                !((String) userData.get("password")).trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode((String) userData.get("password")));
        }

        if (userData.containsKey("roles")) {
            setUserRolesFromMap(existingUser, userData);
        }

        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private void validateUserData(Map<String, Object> userData, boolean isCreate) {
        if (isCreate) {
            if (userData.get("firstName") == null || ((String) userData.get("firstName")).trim().isEmpty()) {
                throw new RuntimeException("First name is required");
            }
            if (userData.get("email") == null || ((String) userData.get("email")).trim().isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            if (userData.get("password") == null || ((String) userData.get("password")).trim().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
        }

        if (userData.containsKey("email") && userData.get("email") != null) {
            String email = (String) userData.get("email");
            if (email.trim().isEmpty()) {
                throw new RuntimeException("Email cannot be empty");
            }
        }
    }

    private void setUserRolesFromMap(User user, Map<String, Object> userData) {
        if (userData.get("roles") != null && userData.get("roles") instanceof List) {
            Set<String> roleNames = new HashSet<>((List<String>) userData.get("roles"));
            Set<Role> roles = roleService.findRolesByNames(roleNames);
            user.setRoles(roles);
        } else {
            Role userRole = roleService.findRoleByName("USER");
            user.setRoles(Set.of(userRole));
        }
    }
}