package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleServiceImpl;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;

import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminController {
    private final UserServiceImpl userServiceImpl;
    private final RoleServiceImpl roleServiceImpl;

    public AdminController(UserServiceImpl userServiceImpl, RoleServiceImpl roleServiceImpl) {
        this.userServiceImpl = userServiceImpl;
        this.roleServiceImpl = roleServiceImpl;
    }

    @GetMapping
    public String getHomePage(Model model, Authentication authentication) {
        List<User> users = userServiceImpl.findAll();
        User user = userServiceImpl.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));
        List<User> sortedUsers = users.stream()
                .sorted((u1, u2) -> {
                    if (u1.getId() == user.getId()) return -1;
                    if (u2.getId() == user.getId()) return 1;
                    return Integer.compare(u1.getId(), u2.getId());
                })
                .collect(Collectors.toList());
        model.addAttribute("users", sortedUsers);
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleServiceImpl.findAll());
        model.addAttribute("rolesAsString", user.getRolesAsString());
        model.addAttribute("currentUserId", user.getId());
        return "index";
    }

    @GetMapping("/edit")
    public String getEditPageForAdmin(@RequestParam int id,
                                      Model model) {
        Optional<User> userOptional = userServiceImpl.findUserById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            model.addAttribute("user", user);
            model.addAttribute("allRoles", roleServiceImpl.findAll());
            model.addAttribute("rolesAsString", user.getRolesAsString());
            return "index";
        } else {
            return "redirect:/admin";
        }
    }

    @GetMapping("/user")
    public String getUsersPageForAdmin(@RequestParam int id,
                                       Model model,
                                       Authentication authentication) {
        User currentUser = userServiceImpl.findUserById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User authUser = userServiceImpl.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<User> users = userServiceImpl.findAll()
                .stream()
                .sorted((u1, u2) -> {
                    if (u1.getId() == authUser.getId()) return -1;
                    if (u2.getId() == authUser.getId()) return 1;
                    return Integer.compare(u1.getId(), u2.getId());
                })
                .collect(Collectors.toList());
        User loggedInUser = userServiceImpl.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        boolean isLoggedInUser = loggedInUser.getId() == currentUser.getId();
        boolean isAdmin = loggedInUser.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().contains("ADMIN"));

        if (isLoggedInUser && isAdmin) {
            return "redirect:/admin";
        }
        model.addAttribute("user", currentUser);
        model.addAttribute("currentUserId", currentUser.getId());
        model.addAttribute("allRoles", roleServiceImpl.findAll());
        model.addAttribute("rolesAsString", currentUser.getRolesAsString());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("users", users);
        return "user";

    }

    @PostMapping("/update")
    public String getAdminPage(@RequestParam int id,
                               @RequestParam String username,
                               @RequestParam(required = false) String password,
                               @RequestParam int age,
                               @RequestParam(required = false) List<String> roles) {
        if (roles != null) {
            Collection<Role> newRoles = roles.stream()
                    .map(role -> roleServiceImpl.findByName(role)
                            .orElseGet(() -> roleServiceImpl.save(new Role(role))))
                    .collect(Collectors.toSet());
            userServiceImpl.updateUser(id, username, age, password, newRoles);
            return "redirect:/admin";
        } else {
            return "redirect:/edit";
        }
    }

    @PostMapping("/add-user")
    public String addUser(@RequestParam String username,
                          @RequestParam int age,
                          @RequestParam String password,
                          @RequestParam(required = false) List<String> roles,
                          Model model) {
        User user = new User(username, age, password);
        if (roles != null && !roles.isEmpty()) {
            Collection<Role> userRoles = roles.stream()
                    .map(roleName -> roleServiceImpl.findByName(roleName)
                            .orElseGet(() -> roleServiceImpl.save(new Role(roleName))))
                    .collect(Collectors.toSet());
            user.setRoles(userRoles);
        }
        userServiceImpl.saveUser(user);
        model.addAttribute("user", user);
        return "redirect:/admin";
    }

    @PostMapping("/delete")
    public String deleteUser(@RequestParam int id) {
        userServiceImpl.deleteUserById(id);
        return "redirect:/admin";
    }
}
