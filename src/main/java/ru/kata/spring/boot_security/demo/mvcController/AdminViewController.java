package ru.kata.spring.boot_security.demo.mvcController;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleServiceImpl;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminViewController {
    private final UserServiceImpl userServiceImpl;
    private final RoleServiceImpl roleServiceImpl;

    public AdminViewController(UserServiceImpl userServiceImpl, RoleServiceImpl roleServiceImpl) {
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
}
