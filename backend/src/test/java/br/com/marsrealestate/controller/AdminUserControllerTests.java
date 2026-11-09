package br.com.marsrealestate.controller;

import br.com.marsrealestate.service.AdminUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminUserControllerTests {
    private final AdminUserService users = mock(AdminUserService.class);
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.standaloneSetup(new AdminUserController(users))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
    }

    @Test
    void validatesEditingAndReturnsUsefulMessages() throws Exception {
        mvc.perform(put("/api/admin/users/2").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Nome\",\"email\":\"invalid\",\"phone\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Informe um e-mail válido."));
        verifyNoInteractions(users);
    }

    @Test
    void preservesConflictDetailsForFailedDeletion() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Não foi possível excluir o usuário e seus anúncios."))
                .when(users).deleteUser(eq(2L), isNull());
        mvc.perform(delete("/api/admin/users/2")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Não foi possível excluir o usuário e seus anúncios."));
    }

    @Test
    void deletionReturnsNoContentAndKeepsServiceAuthorizationFailures() throws Exception {
        mvc.perform(delete("/api/admin/users/2")).andExpect(status().isNoContent());
        verify(users).deleteUser(eq(2L), isNull());
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito a administradores."))
                .when(users).deleteUser(eq(3L), isNull());
        mvc.perform(delete("/api/admin/users/3")).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Acesso restrito a administradores."));
    }
}
