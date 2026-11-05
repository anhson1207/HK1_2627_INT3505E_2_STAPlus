package chat_service.ws.service.impl;

import chat_service.entity.enums.Role;
import chat_service.security.ChatPrincipal;
import chat_service.ws.dto.WsTicketResponse;
import chat_service.ws.model.WsTicket;
import chat_service.ws.service.WsTicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class WsTicketServiceImpl implements WsTicketService {

    @org.springframework.beans.factory.annotation.Value("${app.chat.ws.ticket-ttl-seconds:60}")
    private long ticketTtlSeconds = 60;

    private static final int TICKET_BYTE_LENGTH = 32;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();

    // In-memory atomic store for single-use tickets
    private final Map<String, WsTicket> ticketStore = new ConcurrentHashMap<>();

    @Override
    public WsTicketResponse createTicket(ChatPrincipal principal) {
        if (principal == null || principal.getUserId() == null) {
            throw new IllegalArgumentException("Principal cannot be null");
        }

        byte[] randomBytes = new byte[TICKET_BYTE_LENGTH];
        secureRandom.nextBytes(randomBytes);
        String ticketString = base64Encoder.encodeToString(randomBytes);

        Instant now = Instant.now();
        Duration ttl = Duration.ofSeconds(ticketTtlSeconds);
        Instant expiresAt = now.plus(ttl);

        Role role = null;
        if (principal.getRole() != null) {
            try {
                role = Role.valueOf(principal.getRole().replace("ROLE_", ""));
            } catch (Exception ignored) {}
        }

        WsTicket ticket = WsTicket.builder()
                .ticket(ticketString)
                .userId(principal.getUserId())
                .username(principal.getUsername())
                .role(role)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        ticketStore.put(ticketString, ticket);
        log.debug("Created single-use WS ticket for userId={}, expires in {}s", principal.getUserId(), ticketTtlSeconds);

        return WsTicketResponse.builder()
                .ticket(ticketString)
                .expiresInSeconds(ticketTtlSeconds)
                .build();
    }

    @Override
    public Optional<WsTicket> consumeTicket(String ticket) {
        if (ticket == null || ticket.trim().isEmpty()) {
            return Optional.empty();
        }

        WsTicket wsTicket = ticketStore.remove(ticket.trim());
        if (wsTicket == null) {
            log.warn("Attempted to consume non-existent or already consumed WS ticket");
            return Optional.empty();
        }

        if (wsTicket.getExpiresAt().isBefore(Instant.now())) {
            log.warn("Attempted to consume expired WS ticket for userId={}", wsTicket.getUserId());
            return Optional.empty();
        }

        log.debug("Successfully consumed single-use WS ticket for userId={}", wsTicket.getUserId());
        return Optional.of(wsTicket);
    }

    @Override
    public long getActiveTicketCount() {
        return ticketStore.size();
    }

    @Scheduled(fixedDelay = 60000)
    public void pruneExpiredTickets() {
        Instant now = Instant.now();
        int initialSize = ticketStore.size();
        ticketStore.entrySet().removeIf(entry -> entry.getValue().getExpiresAt().isBefore(now));
        int prunedCount = initialSize - ticketStore.size();
        if (prunedCount > 0) {
            log.debug("Pruned {} expired unconsumed WS tickets", prunedCount);
        }
    }
}

