package br.com.marsrealestate.service;

import br.com.marsrealestate.dto.PropertyRequest;
import br.com.marsrealestate.dto.RegisterRequest;
import br.com.marsrealestate.dto.AdminUserUpdateRequest;
import br.com.marsrealestate.model.*;
import br.com.marsrealestate.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdministratorAccessTests {
    private final UserRepository users = mock(UserRepository.class);
    private final PropertyRepository properties = mock(PropertyRepository.class);
    private final PropertyImageRepository images = mock(PropertyImageRepository.class);
    private final UserAccessService access = new UserAccessService(users);
    private final AdminUserService admin = new AdminUserService(users, access, properties);
    private final PropertyService listing = new PropertyService(properties, access);
    private final PropertyImageService photography = new PropertyImageService(images, properties, access);
    private User actor;
    private User owner;
    private Property property;
    private final Jwt jwt = Jwt.withTokenValue("test").header("alg", "HS256")
            .subject("actor@example.invalid").claim("userId", 1L).claim("role", "ADMIN").build();

    @BeforeEach
    void setup() {
        actor = user(1L, "actor@example.invalid", UserRole.USER);
        owner = user(2L, "owner@example.invalid", UserRole.USER);
        property = new Property();
        ReflectionTestUtils.setField(property, "id", 3L);
        property.setUser(owner);
        property.setTitle("Habitat");
        property.setStatus(PropertyStatus.INACTIVE);
        when(users.findById(1L)).thenAnswer(call -> Optional.of(actor));
        when(users.findById(2L)).thenReturn(Optional.of(owner));
        when(users.findForDeletionById(2L)).thenReturn(Optional.of(owner));
        when(users.save(any())).thenAnswer(call -> call.getArgument(0));
        when(users.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
        when(users.lockAdministrators()).thenAnswer(call -> actor.isAdministrator() ? List.of(actor) : List.of());
        when(properties.findById(3L)).thenReturn(Optional.of(property));
        when(properties.save(any())).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    void ordinaryOwnerOrAgencyCannotReadUsersOrPromoteDespiteAdminTokenClaim() {
        actor.setAccountType(AccountType.AGENCY);
        assertForbidden(() -> admin.listUsers(jwt));
        assertForbidden(() -> admin.grantAdministrator(2L, jwt));
        verify(users, never()).findAll(any(Sort.class));
        verify(users, never()).save(any());
        assertEquals(UserRole.USER, owner.getRole());
    }

    @Test
    void administratorCanListUsersAndGrantRoleWithoutChangingAccountType() {
        actor.setRole(UserRole.ADMIN);
        when(users.findAll(any(Sort.class))).thenReturn(List.of(actor, owner));
        assertEquals(2, admin.listUsers(jwt).size());
        assertEquals(UserRole.ADMIN, admin.grantAdministrator(2L, jwt).role());
        assertEquals(AccountType.OWNER, owner.getAccountType());
        assertEquals(UserRole.ADMIN, admin.grantAdministrator(2L, jwt).role());
        actor.setRole(UserRole.USER);
        assertForbidden(() -> admin.listUsers(jwt));
    }

    @Test
    void missingSessionAndDeletedUserAreUnauthorized() {
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ResponseStatusException.class,
                () -> admin.listUsers(null)).getStatusCode());
        when(users.findById(1L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ResponseStatusException.class,
                () -> admin.grantAdministrator(2L, jwt)).getStatusCode());
    }

    @Test
    void normalUserCannotModifyDeleteOrChangeStatusOfOthersProperty() {
        assertForbidden(() -> listing.updateProperty(3L, null, jwt));
        assertForbidden(() -> listing.deleteProperty(3L, jwt));
        assertForbidden(() -> listing.updatePropertyStatus(3L, PropertyStatus.SOLD, jwt));
        assertForbidden(() -> photography.deleteImage(3L, 10L, jwt));
        verify(properties, never()).delete(any());
        verify(properties, never()).save(any());
    }

    @Test
    void administratorCanEditDeleteAndChangeStatusWithoutTakingOwnership() {
        actor.setRole(UserRole.ADMIN);
        var request = new PropertyRequest("Título editado", "Descrição", PropertyType.ICE_HOME,
                TransactionType.SALE, new BigDecimal("1234.56"), 2, 1, new BigDecimal("80"), 4,
                "Cidade", "Tharsis", "Complexo", "A1", null, null);
        assertEquals("Título editado", listing.updateProperty(3L, request, jwt).title());
        assertSame(owner, property.getUser());
        assertEquals(PropertyStatus.SOLD, listing.updatePropertyStatus(3L, PropertyStatus.SOLD, jwt).status());
        listing.deleteProperty(3L, jwt);
        verify(properties).delete(property);
        // Losing the database role immediately revokes these permissions, even with the same JWT.
        actor.setRole(UserRole.USER);
        assertForbidden(() -> listing.deleteProperty(3L, jwt));
    }

    @Test
    void mineIncludesEveryStatusForAdminAndOnlyOwnListingsForUsers() {
        when(properties.findAll()).thenReturn(List.of(property));
        when(properties.findByUserId(1L)).thenReturn(List.of());
        assertTrue(listing.getMyProperties(jwt).isEmpty());
        verify(properties, never()).findAll();
        actor.setRole(UserRole.ADMIN);
        assertEquals(PropertyStatus.INACTIVE, listing.getMyProperties(jwt).getFirst().status());
    }

    @Test
    void administratorsMayManageImagesForOtherOwners() {
        actor.setRole(UserRole.ADMIN);
        var image = new PropertyImage();
        ReflectionTestUtils.setField(image, "id", 10L);
        property.addImage(image);
        when(images.findByIdAndPropertyId(10L, 3L)).thenReturn(Optional.of(image));
        photography.deleteImage(3L, 10L, jwt);
        assertTrue(property.getImages().isEmpty());
        verify(properties).save(property);
    }

    @Test
    void userPanelNeverSerializesPasswordHashOrProviderIdentifiers() {
        actor.setRole(UserRole.ADMIN);
        owner.setPasswordHash("private-hash");
        owner.setGoogleId("private-google-id");
        when(users.findAll(any(Sort.class))).thenReturn(List.of(owner));
        String json = new ObjectMapper().writeValueAsString(admin.listUsers(jwt));
        assertFalse(json.contains("private-hash"));
        assertFalse(json.contains("passwordHash"));
        assertFalse(json.contains("private-google-id"));
        assertTrue(json.contains("owner@example.invalid"));
    }

    @Test
    void signupAlwaysCreatesOrdinaryUserIncludingMasterEmail() {
        var passwords = mock(PasswordEncoder.class);
        var tokens = mock(JwtService.class);
        when(tokens.generateToken(any())).thenReturn("test-token");
        when(passwords.encode(anyString())).thenReturn("hash");
        var auth = new AuthService(users, passwords, tokens);
        var response = auth.register(new RegisterRequest("Master", "Master@master.com", "11999999999", "password123", AccountType.AGENCY));
        assertEquals(UserRole.USER, response.role());
        assertEquals(AccountType.AGENCY, response.accountType());
    }

    @Test
    void ordinaryUsersCannotEditOrDeleteAccounts() {
        assertForbidden(() -> admin.updateUser(2L, new AdminUserUpdateRequest("Nome", "new@example.invalid", "123"), jwt));
        assertForbidden(() -> admin.deleteUser(2L, jwt));
        verify(users, never()).saveAndFlush(any());
        verify(users, never()).delete(any());
    }

    @Test
    void administratorEditsOnlyContactFieldsAndRejectsDuplicateEmail() {
        actor.setRole(UserRole.ADMIN);
        owner.setPasswordHash("keep-hash");
        var updated = admin.updateUser(2L, new AdminUserUpdateRequest(" Nome atualizado ", "NEW@example.invalid", " 123 "), jwt);
        assertEquals("Nome atualizado", updated.fullName());
        assertEquals("new@example.invalid", updated.email());
        assertEquals("123", updated.phone());
        assertEquals(UserRole.USER, updated.role());
        assertEquals(AccountType.OWNER, updated.accountType());
        assertEquals("keep-hash", owner.getPasswordHash());
        when(users.existsByEmailIgnoreCaseAndIdNot("taken@example.invalid", 2L)).thenReturn(true);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class, () ->
                admin.updateUser(2L, new AdminUserUpdateRequest("Nome", "taken@example.invalid", "123"), jwt)).getStatusCode());
        assertEquals("new@example.invalid", owner.getEmail());
    }

    @Test
    void deletesOnlyAnotherUserWithNoLinkedListings() {
        actor.setRole(UserRole.ADMIN);
        admin.deleteUser(2L, jwt);
        verify(users).delete(owner);
        verify(users).flush();
    }

    @Test
    void rejectsOwnDeletionWithoutDeletingAnything() {
        actor.setRole(UserRole.ADMIN);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class,
                () -> admin.deleteUser(1L, jwt)).getStatusCode());
        verify(users, never()).delete(any());
        verify(properties, never()).deleteAll(anyList());
    }

    @Test
    void deletesLinkedEntitiesBeforeDeletingTheirOwner() {
        actor.setRole(UserRole.ADMIN);
        when(properties.findByUserId(2L)).thenReturn(List.of(property));
        admin.deleteUser(2L, jwt);
        var order = inOrder(properties, users);
        order.verify(users).findForDeletionById(2L);
        order.verify(properties).deleteAll(List.of(property));
        order.verify(properties).flush();
        order.verify(users).delete(owner);
        order.verify(users).flush();
    }

    @Test
    void failureDeletingInventoryDoesNotProceedToDeleteTheUser() {
        actor.setRole(UserRole.ADMIN);
        doThrow(new org.springframework.dao.DataIntegrityViolationException("test failure")).when(properties).flush();
        var error = assertThrows(ResponseStatusException.class, () -> admin.deleteUser(2L, jwt));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertTrue(error.getReason().contains("Nenhuma alteração foi aplicada"));
        verify(users, never()).delete(any());
    }

    @Test
    void deletionRevalidatesAdministratorAfterAcquiringLocks() {
        actor.setRole(UserRole.ADMIN);
        when(users.lockAdministrators()).thenReturn(List.of());
        assertForbidden(() -> admin.deleteUser(2L, jwt));
        verify(users, never()).delete(any());
    }

    @Test
    void missingTargetReturnsNotFoundForEditAndDelete() {
        actor.setRole(UserRole.ADMIN);
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () ->
                admin.updateUser(99L, new AdminUserUpdateRequest("Nome", "new@example.invalid", "123"), jwt)).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () -> admin.deleteUser(99L, jwt)).getStatusCode());
    }

    @Test
    void sessionStaysBoundToIdWhenEmailIsEditedOrReusedAndCannotAccessDeletedUser() {
        actor.setEmail("changed@example.invalid");
        assertSame(actor, access.currentUser(jwt));
        verify(users, never()).findByEmailIgnoreCase(anyString());
        when(users.findById(1L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ResponseStatusException.class,
                () -> access.currentUser(jwt)).getStatusCode());
        var oldEmailOnly = Jwt.withTokenValue("test").header("alg", "HS256").subject("actor@example.invalid").build();
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ResponseStatusException.class,
                () -> access.currentUser(oldEmailOnly)).getStatusCode());
    }

    private static User user(Long id, String email, UserRole role) {
        var user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setFullName("Usuário " + id);
        user.setEmail(email);
        user.setAccountType(AccountType.OWNER);
        user.setRole(role);
        return user;
    }

    private static void assertForbidden(Runnable action) {
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class, action::run).getStatusCode());
    }
}
