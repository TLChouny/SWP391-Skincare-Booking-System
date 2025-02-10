package com.luluspa.luluspa.controller;

import org.springframework.web.bind.annotation.*;

import com.luluspa.luluspa.entity.User;
import com.luluspa.luluspa.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/users")
public class Controller {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public User createUser(@RequestParam String username, @RequestParam String password) {
        User user = new User(username, password);
        return userRepository.save(user);
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
