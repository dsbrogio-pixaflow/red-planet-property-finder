
package br.com.marsrealestate.controller;

import br.com.marsrealestate.model.User;
import br.com.marsrealestate.service.UserAccessService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAccessService access;

    public UserController(UserAccessService access) {
        this.access = access;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @AuthenticationPrincipal Jwt jwt) {

        User user = access.currentUser(jwt);

        Map<String, Object> response = Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "phone", user.getPhone(),
            "accountType", user.getAccountType().name(),
            "role", user.getRole().name()
        );

        return ResponseEntity.ok(response);
    }
}
