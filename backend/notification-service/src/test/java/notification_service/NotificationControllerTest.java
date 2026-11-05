package notification_service;

import notification_service.dto.event.DealCreatedEvent;
import notification_service.dto.event.TicketAssignedEvent;
import notification_service.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class NotificationControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private NotificationService notificationService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testDealAndTicketNotifications() throws Exception {
        DealCreatedEvent dealEvent = new DealCreatedEvent();
        dealEvent.setDealId(101L);
        dealEvent.setDealName("Tech Corp Enterprise Deal");
        dealEvent.setCreatedByUserId(1L);
        dealEvent.setRecipientUserId(1L);
        dealEvent.setCreatedAt(LocalDateTime.now());
        notificationService.createDealNotification(dealEvent);

        TicketAssignedEvent ticketEvent = new TicketAssignedEvent();
        ticketEvent.setTicketId(202L);
        ticketEvent.setTicketTitle("VPN Access Issue");
        ticketEvent.setSupportId(1L);
        ticketEvent.setAssignedByUserId(1L);
        ticketEvent.setCreatedAt(LocalDateTime.now());
        notificationService.createTicketAssignedNotification(ticketEvent);

        mockMvc.perform(get("/api/v1/notifications")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNumber());

        mockMvc.perform(patch("/api/v1/notifications/read-all")
                        .header("X-User-Id", "1"))
                .andExpect(status().isNoContent());
    }
}

