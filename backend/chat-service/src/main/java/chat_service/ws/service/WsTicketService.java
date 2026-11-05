package chat_service.ws.service;

import chat_service.security.ChatPrincipal;
import chat_service.ws.dto.WsTicketResponse;
import chat_service.ws.model.WsTicket;

import java.util.Optional;

public interface WsTicketService {

    WsTicketResponse createTicket(ChatPrincipal principal);

    Optional<WsTicket> consumeTicket(String ticket);

    long getActiveTicketCount();
}

