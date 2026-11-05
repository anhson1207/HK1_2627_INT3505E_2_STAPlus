package chat_service.ws;

import chat_service.security.ChatPrincipal;
import chat_service.ws.dto.WsTicketResponse;
import chat_service.ws.model.WsTicket;
import chat_service.ws.service.impl.WsTicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class WsTicketServiceTest {

    private WsTicketServiceImpl ticketService;
    private ChatPrincipal activeUser;

    @BeforeEach
    void setUp() {
        ticketService = new WsTicketServiceImpl();

        activeUser = ChatPrincipal.builder()
                .userId(100L)
                .username("test_active_user")
                .email("active@crm.local")
                .role("SALES")
                .build();
    }

    @Test
    @DisplayName("Tạo ticket thành công cho user ACTIVE: Ticket có entropy cao, không rỗng và có hạn 60s")
    void testCreateTicket_Success() {
        WsTicketResponse response = ticketService.createTicket(activeUser);

        assertNotNull(response);
        assertNotNull(response.getTicket());
        assertTrue(response.getTicket().length() >= 32);
        assertEquals(60, response.getExpiresInSeconds());
        assertEquals(1, ticketService.getActiveTicketCount());
    }

    @Test
    @DisplayName("Tạo ticket thất bại nếu principal null hoặc không có userId")
    void testCreateTicket_NullUser_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> ticketService.createTicket(null));
        assertThrows(IllegalArgumentException.class, () -> ticketService.createTicket(new ChatPrincipal()));
    }

    @Test
    @DisplayName("Tiêu thụ ticket Single-Use: Lần đầu thành công, lần thứ 2 thất bại (chống replay)")
    void testConsumeTicket_SingleUseGuarantee() {
        WsTicketResponse response = ticketService.createTicket(activeUser);
        String ticket = response.getTicket();

        Optional<WsTicket> firstConsumption = ticketService.consumeTicket(ticket);
        assertTrue(firstConsumption.isPresent());
        assertEquals(activeUser.getUserId(), firstConsumption.get().getUserId());
        assertEquals(activeUser.getUsername(), firstConsumption.get().getUsername());

        Optional<WsTicket> secondConsumption = ticketService.consumeTicket(ticket);
        assertTrue(secondConsumption.isEmpty(), "Ticket đã sử dụng không được phép tái sử dụng");

        assertEquals(0, ticketService.getActiveTicketCount());
    }

    @Test
    @DisplayName("Tiêu thụ đồng thời (Concurrent Race): Đúng 1 thread thành công, các thread khác thất bại")
    void testConsumeTicket_ConcurrentAccess() throws InterruptedException {
        WsTicketResponse response = ticketService.createTicket(activeUser);
        String ticket = response.getTicket();

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    Optional<WsTicket> result = ticketService.consumeTicket(ticket);
                    if (result.isPresent()) {
                        successCount.incrementAndGet();
                    } else {
                        failCount.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(finishLatch.await(5, TimeUnit.SECONDS));
        executor.shutdown();

        assertEquals(1, successCount.get(), "Chỉ duy nhất 1 thread được tiêu thụ ticket thành công");
        assertEquals(threadCount - 1, failCount.get(), "Tất cả các thread còn lại phải bị từ chối");
    }

    @Test
    @DisplayName("Tiêu thụ ticket không tồn tại hoặc rỗng trả về Optional.empty")
    void testConsumeTicket_Invalid() {
        assertTrue(ticketService.consumeTicket("non_existent_ticket_123").isEmpty());
        assertTrue(ticketService.consumeTicket("").isEmpty());
        assertTrue(ticketService.consumeTicket(null).isEmpty());
    }
}

