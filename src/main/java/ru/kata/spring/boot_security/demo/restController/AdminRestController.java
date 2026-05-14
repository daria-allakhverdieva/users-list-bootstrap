package ru.kata.spring.boot_security.demo.restController;

import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.model.dto.UpdateUserDto;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminRestController {
    private final UserServiceImpl userService;

    public AdminRestController(UserServiceImpl userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getUserPage(@PathVariable int id) {
        return userService.findUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("User with id = " + id + " not found"));
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable int id,
                           @RequestBody UpdateUserDto userDto) {
        UpdateUserDto updatedDto = new UpdateUserDto(
                id,
                userDto.username(),
                userDto.age(),
                userDto.password(),
                userDto.roles()
        );
         userService.updateUser(updatedDto);
         return updatedDto.toEntity();
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable int id) {
        userService.deleteUserById(id);
    }

}
