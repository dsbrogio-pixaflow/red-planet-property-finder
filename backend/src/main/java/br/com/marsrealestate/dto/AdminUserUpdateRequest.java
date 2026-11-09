package br.com.marsrealestate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Only editable contact fields; role, password and account type cannot be mass-assigned. */
public record AdminUserUpdateRequest(
        @NotBlank(message = "Informe o nome completo.") @Size(max = 150, message = "O nome deve ter até 150 caracteres.") String fullName,
        @NotBlank(message = "Informe o e-mail.") @Email(message = "Informe um e-mail válido.") @Size(max = 180, message = "O e-mail deve ter até 180 caracteres.") String email,
        @NotBlank(message = "Informe o telefone.") @Size(max = 20, message = "O telefone deve ter até 20 caracteres.") String phone) {}
