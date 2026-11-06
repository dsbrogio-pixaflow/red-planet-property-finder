package br.com.marsrealestate.dto;

import br.com.marsrealestate.model.AccountType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

    @NotBlank(message = "O nome completo é obrigatório")
    @Size(max = 150)
    String fullName,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    @Size(max = 180)
    String email,

    @NotBlank(message = "O telefone é obrigatório")
    @Size(max = 20)
    String phone,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    String password,

    @NotNull(message = "Selecione o tipo de conta")
    AccountType accountType

) {
}