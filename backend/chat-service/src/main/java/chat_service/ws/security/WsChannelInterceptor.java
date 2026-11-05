package chat_service.ws.security;

import chat_service.ws.model.WsPrincipal;
import chat_service.ws.model.WsTicket;
import chat_service.ws.service.WsTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class WsChannelInterceptor implements ChannelInterceptor {

    private final WsTicketService ticketService;
    private final chat_service.security.UserStatusService userStatusService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
        } else if (StompCommand.SEND.equals(command)) {
            handleSend(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();

        if (user == null) {
            String ticket = accessor.getFirstNativeHeader("ticket");
            if (ticket == null || ticket.trim().isEmpty()) {
                ticket = accessor.getFirstNativeHeader("passcode");
            }

            if (ticket == null || ticket.trim().isEmpty()) {
                log.warn("STOMP CONNECT rejected: missing ticket in handshake and STOMP headers");
                throw new MessageDeliveryException("Unauthorized: single-use ticket is required to connect");
            }

            Optional<WsTicket> wsTicketOpt = ticketService.consumeTicket(ticket);
            if (wsTicketOpt.isEmpty()) {
                log.warn("STOMP CONNECT rejected: invalid or expired ticket");
                throw new MessageDeliveryException("Unauthorized: invalid or expired ticket");
            }

            WsTicket wsTicket = wsTicketOpt.get();
            WsPrincipal principal = new WsPrincipal(wsTicket.getUserId(), wsTicket.getUsername(), wsTicket.getRole());
            accessor.setUser(principal);
            log.debug("STOMP CONNECT authenticated via header for userId={}", wsTicket.getUserId());
        }

        if (accessor.getUser() instanceof WsPrincipal wsPrincipal) {
            if (!userStatusService.isUserActive(wsPrincipal.getUserId())) {
                log.warn("STOMP CONNECT rejected: user {} is DISABLED", wsPrincipal.getUserId());
                throw new MessageDeliveryException("Unauthorized: account has been deactivated");
            }
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
        if (user == null) {
            log.warn("STOMP SUBSCRIBE rejected: unauthenticated session");
            throw new MessageDeliveryException("Unauthorized: session is not authenticated");
        }

        if (user instanceof WsPrincipal wsPrincipal) {
            if (!userStatusService.isUserActive(wsPrincipal.getUserId())) {
                log.warn("STOMP SUBSCRIBE rejected: user {} is DISABLED", wsPrincipal.getUserId());
                throw new MessageDeliveryException("Unauthorized: account has been deactivated");
            }
        }

        String destination = accessor.getDestination();
        if (destination == null || destination.trim().isEmpty()) {
            throw new MessageDeliveryException("Destination cannot be empty");
        }

        boolean isUserQueue = destination.equals("/user/queue/events")
                || destination.startsWith("/user/queue/");

        if (!isUserQueue) {
            log.warn("User {} attempted to subscribe to unauthorized destination: {}", user.getName(), destination);
            throw new MessageDeliveryException("Access denied: cannot subscribe to destination " + destination);
        }
    }

    private void handleSend(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination != null && !destination.startsWith("/app/heartbeat") && !destination.startsWith("/app/ping")) {
            log.warn("Blocked direct STOMP SEND to {}. Messages must be sent via REST API.", destination);
            throw new MessageDeliveryException("Chat messages must be sent via REST API");
        }
    }
}

