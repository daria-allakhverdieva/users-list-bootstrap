package ru.kata.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;

@Controller
public class CommonController {

    @GetMapping("/")
    public String getWelcomePage() {
        return "welcome";
    }
}
