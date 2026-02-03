package org.example.config;

import org.example.model.Role;
import org.example.repository.RoleRepository;
import org.example.service.UserService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner initData(RoleRepository roleRepository,
                                      UserService userService) {
        return args -> {
            if (roleRepository.count() == 0) {
                Role adminRole = new Role("ADMIN");
                Role userRole = new Role("USER");
                roleRepository.save(adminRole);
                roleRepository.save(userRole);
            }

            if (userService.findAllUsers().isEmpty()) {
                Map<String, Object> adminData = new HashMap<>();
                adminData.put("firstName", "Admin");
                adminData.put("lastName", "Adminov");
                adminData.put("age", 30);
                adminData.put("email", "admin@mail.ru");
                adminData.put("password", "password");
                adminData.put("roles", List.of("ADMIN", "USER"));

                userService.createUserFromMap(adminData);

                Map<String, Object> userData = new HashMap<>();
                userData.put("firstName", "User");
                userData.put("lastName", "Userov");
                userData.put("age", 25);
                userData.put("email", "user@mail.ru");
                userData.put("password", "password");
                userData.put("roles", List.of("USER"));

                userService.createUserFromMap(userData);
            }
        };
    }
}