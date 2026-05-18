package ru.kata.spring.boot_security.demo.mvcController;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CommonController {

    @GetMapping("/")
    public String getWelcomePage() {
        return "redirect:/login";
    }
}