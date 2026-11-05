package auth_service.controller;

import auth_service.dto.response.UserResponse;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/users")
@RequiredArgsConstructor
@Slf4j
public class InternalUserController {

    private final UserRepository userRepository;

    @Value("${app.internal-key}")
    private String internalKey;

    @PostConstruct
    public void validateKey() {
        if (internalKey == null || internalKey.isBlank() || internalKey.length() < 16) {
            throw new IllegalStateException("FATAL: INTERNAL_SERVICE_KEY must be configured and at least 16 characters long!");
        }
    }

    private boolean isInternalIp(String remoteAddr) {
        if (remoteAddr == null || remoteAddr.isBlank()) return false;
        return remoteAddr.equals("127.0.0.1") || remoteAddr.equals("0:0:0:0:0:0:0:1") || remoteAddr.equals("::1")
                || remoteAddr.startsWith("10.") || remoteAddr.startsWith("192.168.")
                || remoteAddr.matches("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..*");
    }

    private void validateInternalAccess(String headerKey, HttpServletRequest request) {
        if (headerKey == null || !headerKey.equals(internalKey)) {
            log.warn("Unauthorized internal request: invalid or missing X-Internal-Key");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid internal service key");
        }
        if (request != null) {
            String remote = request.getRemoteAddr();
            if (!isInternalIp(remote)) {
                log.warn("Unauthorized internal request from non-internal IP: {}", remote);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access restricted to internal network");
            }
        }
    }

    @GetMapping("/colleagues")
    public ResponseEntity<List<UserResponse>> getColleagues(
            @RequestHeader(value = "X-Internal-Key", required = false) String headerKey,
            @RequestParam(value = "search", required = false) String search,
            HttpServletRequest request) {
        validateInternalAccess(headerKey, request);

        List<User> users = userRepository.searchColleagues(UserStatus.ACTIVE, search);
        List<UserResponse> response = users.stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @RequestHeader(value = "X-Internal-Key", required = false) String headerKey,
            @PathVariable("id") Long id,
            HttpServletRequest request) {
        validateInternalAccess(headerKey, request);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ResponseEntity.ok(toResponse(user));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<UserResponse>> getUsersByIds(
            @RequestHeader(value = "X-Internal-Key", required = false) String headerKey,
            @RequestBody List<Long> ids,
            HttpServletRequest request) {
        validateInternalAccess(headerKey, request);

        List<User> users = userRepository.findAllById(ids);
        List<UserResponse> response = users.stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .status(u.getStatus())
                .build();
    }
}

