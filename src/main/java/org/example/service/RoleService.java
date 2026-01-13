package org.example.service;

import org.example.model.Role;
import java.util.List;
import java.util.Set;

public interface RoleService {
    List<Role> findAllRoles();
    Role findRoleByName(String name);
    Set<Role> findRolesByNames(Set<String> roleNames);
}