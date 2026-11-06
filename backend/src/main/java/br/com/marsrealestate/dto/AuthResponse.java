
package br.com.marsrealestate.dto;

import br.com.marsrealestate.model.AccountType;

public record AuthResponse(
        Long id,
        String fullName,
        String email,
        AccountType accountType,
        String token
) {}
