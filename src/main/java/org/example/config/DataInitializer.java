package org.example.config;

import org.example.model.Role;
import org.example.model.User;
import org.example.repository.RoleRepository;
import org.example.service.RoleService;
import org.example.service.UserService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner initData(UserService userService,
                                      RoleService roleService,
                                      RoleRepository roleRepository) {
        return args -> {
            if (roleService.findAllRoles().isEmpty()) {
                Role adminRole = new Role("ADMIN");
                Role userRole = new Role("USER");

                roleRepository.save(adminRole);
                roleRepository.save(userRole);
            }

            if (userService.findAllUsers().isEmpty()) {
                User admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("Adminov");
                admin.setAge(30);
                admin.setEmail("admin@mail.ru");
                admin.setPassword("password");

                Set<String> adminRoles = new HashSet<>();
                adminRoles.add("ADMIN");
                adminRoles.add("USER");

                userService.createUser(admin, adminRoles);

                User user = new User();
                user.setFirstName("User");
                user.setLastName("Userov");
                user.setAge(25);
                user.setEmail("user@mail.ru");
                user.setPassword("password");

                Set<String> userRoles = new HashSet<>();
                userRoles.add("USER");

                userService.createUser(user, userRoles);
            }
        };
    }
}