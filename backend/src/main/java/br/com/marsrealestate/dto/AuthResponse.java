
package br.com.marsrealestate.dto;

import br.com.marsrealestate.model.AccountType;
import br.com.marsrealestate.model.UserRole;

public record AuthResponse(
        Long id,
        String fullName,
        String email,
        AccountType accountType,
        UserRole role,
        String token
) {}
