package chat_service.client;

import chat_service.dto.ChatUserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class AuthServiceClient {

    private final RestClient restClient;
    private final String internalKey;

    public AuthServiceClient(
            @Value("${services.auth-service.url:http://localhost:8081}") String authServiceUrl,
            @Value("${app.internal-key}") String internalKey
    ) {
        if (internalKey == null || internalKey.isBlank() || internalKey.length() < 16) {
            throw new IllegalStateException("FATAL: INTERNAL_SERVICE_KEY must be configured and at least 16 characters long!");
        }
        this.internalKey = internalKey;
        this.restClient = RestClient.builder()
                .baseUrl(authServiceUrl)
                .build();
    }

    public List<ChatUserResponse> getColleagues(String search) {
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/internal/users/colleagues")
                            .queryParam("search", search != null ? search : "")
                            .build())
                    .header("X-Internal-Key", internalKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<ChatUserResponse>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch colleagues from auth-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public Optional<ChatUserResponse> getUserById(Long userId) {
        try {
            ChatUserResponse user = restClient.get()
                    .uri("/api/v1/internal/users/{id}", userId)
                    .header("X-Internal-Key", internalKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(ChatUserResponse.class);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            log.error("Failed to fetch user {} from auth-service: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    public List<ChatUserResponse> getUsersByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return restClient.post()
                    .uri("/api/v1/internal/users/batch")
                    .header("X-Internal-Key", internalKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ids)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<ChatUserResponse>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch batch users from auth-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}

