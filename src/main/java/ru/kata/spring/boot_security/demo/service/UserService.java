package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.model.dto.UpdateUserDto;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);
    List<User> findAll();
    Optional<User> findUserById(int id);
    User saveUser(User user);
    void deleteUserById(int id);
    User updateUser(UpdateUserDto user);
}
