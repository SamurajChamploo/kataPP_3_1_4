package org.example.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Component
public class SuccessUserHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Set<String> roles = new HashSet<>();

        authorities.forEach(authority -> roles.add(authority.getAuthority().toLowerCase()));

        if (roles.contains("admin") || roles.contains("role_admin")) {
            response.sendRedirect("/admin");
        } else if (roles.contains("user") || roles.contains("role_user")) {
            response.sendRedirect("/user");
        } else {
            response.sendRedirect("/");
        }
    }
}