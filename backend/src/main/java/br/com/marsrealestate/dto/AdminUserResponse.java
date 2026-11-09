package br.com.marsrealestate.dto;

import br.com.marsrealestate.model.AccountType;
import br.com.marsrealestate.model.User;
import br.com.marsrealestate.model.UserRole;
import java.time.LocalDateTime;

/** Never expose password hashes, provider IDs or tokens in the user panel. */
public record AdminUserResponse(Long id, String fullName, String email, String phone, AccountType accountType,
                                UserRole role, LocalDateTime createdAt) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
                user.getAccountType(), user.getRole(), user.getCreatedAt());
    }
}
