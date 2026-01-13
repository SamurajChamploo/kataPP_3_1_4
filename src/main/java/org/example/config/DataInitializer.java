package org.example.config;

import org.example.model.Role;
import org.example.model.User;
import org.example.service.RoleService;
import org.example.service.UserService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner initData(UserService userService,
                                      RoleService roleService,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (roleService.findAllRoles().isEmpty()) {
                Role adminRole = new Role("ADMIN");
                Role userRole = new Role("USER");
            }

            if (userService.findAllUsers().isEmpty()) {
                Role adminRole = roleService.findRoleByName("ADMIN");
                Role userRole = roleService.findRoleByName("USER");

                User admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("Adminov");
                admin.setAge(30);
                admin.setEmail("admin@mail.ru");
                admin.setPassword(passwordEncoder.encode("12345"));

                Set<Role> adminRoles = new HashSet<>();
                adminRoles.add(adminRole);
                adminRoles.add(userRole);
                admin.setRoles(adminRoles);

                userService.saveUser(admin);

                User user = new User();
                user.setFirstName("User");
                user.setLastName("Userov");
                user.setAge(25);
                user.setEmail("user@mail.ru");
                user.setPassword(passwordEncoder.encode("12345"));

                Set<Role> userRoles = new HashSet<>();
                userRoles.add(userRole);
                user.setRoles(userRoles);

                userService.saveUser(user);
            }
        };
    }
}