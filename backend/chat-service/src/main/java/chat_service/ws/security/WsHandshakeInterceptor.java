package chat_service.ws.security;

import chat_service.ws.model.WsPrincipal;
import chat_service.ws.model.WsTicket;
import chat_service.ws.service.WsTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class WsHandshakeInterceptor implements HandshakeInterceptor {

    private final WsTicketService ticketService;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        String ticket = extractTicket(request);
        if (ticket != null) {
            Optional<WsTicket> wsTicketOpt = ticketService.consumeTicket(ticket);
            if (wsTicketOpt.isEmpty()) {
                log.warn("WS Handshake rejected: invalid, expired, or already consumed ticket");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            WsTicket wsTicket = wsTicketOpt.get();
            WsPrincipal principal = new WsPrincipal(wsTicket.getUserId(), wsTicket.getUsername(), wsTicket.getRole());
            attributes.put(CustomHandshakeHandler.PRINCIPAL_ATTR, principal);
            log.debug("WS Handshake authenticated via ticket for userId={}", wsTicket.getUserId());
            return true;
        }

        // Allow proceed to STOMP CONNECT frame authentication if ticket header is used
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // no-op
    }

    private String extractTicket(ServerHttpRequest request) {
        URI uri = request.getURI();
        String query = uri.getQuery();
        if (query == null) return null;

        for (String param : query.split("&")) {
            String[] pair = param.split("=", 2);
            if ("ticket".equalsIgnoreCase(pair[0]) && pair.length == 2) {
                return pair[1];
            }
        }
        return null;
    }
}

