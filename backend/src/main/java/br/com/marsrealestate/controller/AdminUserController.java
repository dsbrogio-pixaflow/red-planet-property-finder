package br.com.marsrealestate.controller;

import br.com.marsrealestate.dto.AdminUserResponse;
import br.com.marsrealestate.dto.AdminUserUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import br.com.marsrealestate.service.AdminUserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final AdminUserService users;

    public AdminUserController(AdminUserService users) { this.users = users; }

    @GetMapping
    public List<AdminUserResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return users.listUsers(jwt);
    }

    @PutMapping("/{id}/administrator")
    public AdminUserResponse grant(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return users.grantAdministrator(id, jwt);
    }

    @PutMapping("/{id}")
    public AdminUserResponse update(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request,
                                    @AuthenticationPrincipal Jwt jwt) {
        return users.updateUser(id, request, jwt);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        users.deleteUser(id, jwt);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleOperationError(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("message",
                error.getReason() == null ? "Não foi possível concluir esta operação." : error.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidation(MethodArgumentNotValidException error) {
        String message = error.getBindingResult().getFieldErrors().stream()
                .map(field -> field.getDefaultMessage()).filter(java.util.Objects::nonNull)
                .findFirst().orElse("Verifique os dados informados.");
        return Map.of("message", message);
    }
}
