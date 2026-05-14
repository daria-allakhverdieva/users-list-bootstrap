package ru.kata.spring.boot_security.demo.model.dto;

import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.Objects;
import java.util.Set;

public record UpdateUserDto(int id, String username, int age, String password, Set<Role> roles) {

    public User toEntity() {
        return new User(id, username, age, password, roles);
    }


}
