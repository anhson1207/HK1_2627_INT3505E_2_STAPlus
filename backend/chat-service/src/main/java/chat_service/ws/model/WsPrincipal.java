package chat_service.ws.model;

import chat_service.entity.enums.Role;
import lombok.Getter;

import java.security.Principal;
import java.util.Objects;

@Getter
public class WsPrincipal implements Principal {

    private final Long userId;
    private final String username;
    private final Role role;
    private final String name;

    public WsPrincipal(Long userId, String username, Role role) {
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.username = username;
        this.role = role;
        this.name = userId.toString();
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WsPrincipal that = (WsPrincipal) o;
        return Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }

    @Override
    public String toString() {
        return "WsPrincipal(userId=" + userId + ", username=" + username + ", role=" + role + ")";
    }
}

