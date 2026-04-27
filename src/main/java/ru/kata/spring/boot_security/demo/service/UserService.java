package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);
    List<User> findAll();
    Optional<User> findUserById(int id);
    void saveUser(User user);
    void deleteUserById(int id);
    void updateUser(int id, String newUsername, int age, String password, Collection<Role> roles);
}
