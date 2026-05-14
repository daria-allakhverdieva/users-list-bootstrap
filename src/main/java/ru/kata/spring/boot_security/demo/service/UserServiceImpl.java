package ru.kata.spring.boot_security.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.model.dto.UpdateUserDto;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.*;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findUserById(int id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User saveUser(User user) {
        if (user.getRoles().isEmpty() || user.getRoles() == null) {
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(new Role("USER")));
            user.setRoles(Collections.singleton(userRole));
        } else {
            Set<Role> managedRoles = new HashSet<>();
            for (Role role : user.getRoles()) {
                Role managedRole = roleRepository.findByName(role.getName())
                        .orElseThrow(() -> new IllegalArgumentException(
                                ("Role with name '" + role.getName() + "' not found")));
                managedRoles.add(managedRole);
            }
            user.setRoles(managedRoles);
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UpdateUserDto updateUserDto) {
        return userRepository.findById(updateUserDto.id())
                .map(existingUser -> {
                    existingUser.setUsername(updateUserDto.username());
                    existingUser.setAge(updateUserDto.age());

                    if (updateUserDto.password() != null &&
                            !updateUserDto.password().isEmpty()) {
                        existingUser.setPassword(passwordEncoder.encode(updateUserDto.password()));
                    }

                    if (updateUserDto.roles() != null && !updateUserDto.roles().isEmpty()) {
                        Set<Role> managedRoles = new HashSet<>();
                        for (Role role : updateUserDto.roles()) {
                            Role managedRole = roleRepository.findByName(role.getName())
                                    .orElseThrow(() -> new IllegalArgumentException(
                                            ("Role with name '" + role.getName() + "' not found")));
                            managedRoles.add(managedRole);
                        }
                        existingUser.setRoles(managedRoles);
                    }

                    return userRepository.save(existingUser);
                })
                .orElseThrow(() -> new IllegalArgumentException("User with id " + updateUserDto.id() + " not found"));
    }


    @Transactional
    public void deleteUserById(int id) {
        userRepository.deleteById(id);
    }
}
