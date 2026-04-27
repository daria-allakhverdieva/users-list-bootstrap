package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;
import java.util.List;
import java.util.Optional;


@Controller
public class UserController {
    private final UserServiceImpl userServiceImpl;

    @Autowired
    public UserController(UserServiceImpl userServiceImpl) {
        this.userServiceImpl = userServiceImpl;
    }

    @GetMapping("/user")
    public String getUsersPage(Model model, Authentication auth) {
        List<User> users = userServiceImpl.findAll();
        Optional<User> userOptional = userServiceImpl.findByUsername(auth.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            model.addAttribute("rolesAsString", user.getRolesAsString());
            model.addAttribute("user", user);
            model.addAttribute("users", users);
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().contains("ADMIN"));
            model.addAttribute("isAdmin", isAdmin);
            return "user";
        } else {
            return "redirect:/login";
        }
    }
}
