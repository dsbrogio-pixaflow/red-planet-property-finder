package br.com.marsrealestate.service;

import br.com.marsrealestate.dto.AdminUserResponse;
import br.com.marsrealestate.dto.AdminUserUpdateRequest;
import br.com.marsrealestate.model.User;
import br.com.marsrealestate.model.UserRole;
import br.com.marsrealestate.repository.UserRepository;
import br.com.marsrealestate.repository.PropertyRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@Service
public class AdminUserService {
    private final UserRepository users;
    private final UserAccessService access;
    private final PropertyRepository properties;

    public AdminUserService(UserRepository users, UserAccessService access, PropertyRepository properties) {
        this.users = users;
        this.access = access;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers(Jwt jwt) {
        access.requireAdministrator(jwt);
        return users.findAll(Sort.by("fullName").ascending().and(Sort.by("id")))
                .stream().map(AdminUserResponse::from).toList();
    }

    @Transactional
    public AdminUserResponse grantAdministrator(Long id, Jwt jwt) {
        access.requireAdministrator(jwt);
        User target = users.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        target.setRole(UserRole.ADMIN);
        return AdminUserResponse.from(users.save(target));
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, AdminUserUpdateRequest request, Jwt jwt) {
        access.requireAdministrator(jwt);
        User target = users.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCaseAndIdNot(email, id)) throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Este e-mail já está cadastrado para outro usuário.");
        target.setFullName(request.fullName().trim());
        target.setEmail(email);
        target.setPhone(request.phone().trim());
        try {
            return AdminUserResponse.from(users.saveAndFlush(target));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não foi possível salvar. Verifique se o e-mail já está em uso.");
        }
    }

    @Transactional
    public void deleteUser(Long id, Jwt jwt) {
        User actor = access.requireAdministrator(jwt);
        // Serialize admin deletions so two administrators cannot concurrently delete each other.
        List<User> administrators = users.lockAdministrators();
        if (administrators.stream().noneMatch(admin -> admin.getId().equals(actor.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito a administradores.");
        }
        if (actor.getId().equals(id)) throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Não é possível excluir sua própria conta.");
        // Lock the owner before loading inventory so concurrent FK inserts cannot add new listings.
        User target = users.findForDeletionById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        try {
            // Entity deletion preserves JPA cascades for property details and image records.
            // Do not replace with a bulk delete, which would bypass those cascades.
            properties.deleteAll(properties.findByUserId(id));
            properties.flush();
            users.delete(target);
            users.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não foi possível excluir o usuário e seus anúncios. Nenhuma alteração foi aplicada. Tente novamente.");
        }
    }
}
