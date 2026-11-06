package br.com.marsrealestate.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatusController {

    @GetMapping("/api/status")
    public Map<String, String> status() {
        return Map.of(
            "application", "Mars Real Estate",
            "status", "ONLINE",
            "backend", "Java Spring Boot"
        );
    }
}