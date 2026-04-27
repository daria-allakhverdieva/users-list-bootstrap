package ru.kata.spring.boot_security.demo.configs;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleServiceImpl;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;

import java.util.Collections;


@Component
public class UserInitializer implements ApplicationRunner {

    private final UserServiceImpl userServiceImpl;
    private final RoleServiceImpl roleServiceImpl;

    public UserInitializer(UserServiceImpl userServiceImpl, RoleServiceImpl roleServiceImpl) {
        this.userServiceImpl = userServiceImpl;
        this.roleServiceImpl = roleServiceImpl;
    }

    @Override
    public void run(ApplicationArguments args) {
        Role roleUser = roleServiceImpl.findByName("USER")
                .orElseGet(() -> roleServiceImpl.save(new Role("USER")));

        Role roleAdmin = roleServiceImpl.findByName("ADMIN")
                .orElseGet(() -> roleServiceImpl.save(new Role("ADMIN")));

        userServiceImpl.findByUsername("admin")
                .orElseGet(() -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setAge(25);
                    admin.setPassword("admin");
                    admin.setRoles(Collections.singleton(roleAdmin));
                    userServiceImpl.saveUser(admin);
                    return admin;
                });

        userServiceImpl.findByUsername("user")
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername("user");
                    user.setAge(30);
                    user.setPassword("user");
                    user.setRoles(Collections.singleton(roleUser));
                    userServiceImpl.saveUser(user);
                    return user;
                });
    }
}
