
package br.com.marsrealestate.controller;

import br.com.marsrealestate.model.User;
import br.com.marsrealestate.repository.UserRepository;

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

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @AuthenticationPrincipal Jwt jwt) {

        String email = jwt.getSubject();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "Usuário não encontrado."
                    )
                );

        Map<String, Object> response = Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "phone", user.getPhone(),
            "accountType", user.getAccountType().name()
        );

        return ResponseEntity.ok(response);
    }
}
