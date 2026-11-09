package br.com.marsrealestate.service;

import br.com.marsrealestate.model.User;
import br.com.marsrealestate.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserAccessService {
    private final UserRepository users;

    public UserAccessService(UserRepository users) { this.users = users; }

    public User currentUser(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Entre na sua conta.");
        Object claim = jwt.getClaim("userId");
        if (!(claim instanceof Number id) || id.longValue() <= 0) throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Sessão inválida. Entre novamente.");
        // E-mail is editable and may be reused. A session must remain bound to its immutable user ID.
        return users.findById(id.longValue()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado não encontrado."));
    }

    public User requireAdministrator(Jwt jwt) {
        User user = currentUser(jwt);
        // Consult the database on every privileged request; never trust a stale JWT role.
        if (!user.isAdministrator()) throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Acesso restrito a administradores.");
        return user;
    }
}
