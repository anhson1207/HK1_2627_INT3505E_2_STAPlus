package auth_service.config;

import auth_service.entity.AuditLog;
import auth_service.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class AuditLogSeeder implements CommandLineRunner {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void run(String... args) {
        if (auditLogRepository.count() > 0) {
            log.info("AuditLog table already populated ({} records)", auditLogRepository.count());
            return;
        }

        log.info("Seeding initial AuditLog records...");

        LocalDateTime now = LocalDateTime.now();

        List<AuditLog> seeds = List.of(
                AuditLog.builder()
                        .timestamp(now.minusMinutes(5))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("ASSIGN")
                        .module("LEAD")
                        .entityType("Lead")
                        .entityId("26-LEADS")
                        .description("Phân bổ tự động 26 Lead cho 3 nhân viên Sales theo thuật toán Round-Robin")
                        .ipAddress("127.0.0.1")
                        .status("SUCCESS")
                        .details("{\"strategy\": \"ROUND_ROBIN\", \"assignedCount\": 26, \"sales\": [\"Trần Minh\", \"Phạm Bảo Trúc\", \"Đỗ Hải Anh\"]}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusMinutes(22))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("CREATE")
                        .module("LEAD")
                        .entityType("Lead")
                        .entityId("42")
                        .description("Thu thập Lead tự động qua Webhook từ Form Website: Auto Assign Test 3")
                        .ipAddress("118.69.182.44")
                        .status("SUCCESS")
                        .details("{\"channel\": \"WEBSITE\", \"email\": \"auto_assign3@staplus.vn\", \"phone\": \"0981122336\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusMinutes(40))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("ROLE_CHANGE")
                        .module("USER")
                        .entityType("User")
                        .entityId("5")
                        .description("Cập nhật vai trò người dùng 'Đỗ Hải Anh' (haianh@crm.com) thành SALES")
                        .ipAddress("127.0.0.1")
                        .status("SUCCESS")
                        .details("{\"oldRole\": \"UNASSIGNED\", \"newRole\": \"SALES\", \"department\": \"Kinh doanh\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusHours(1).minusMinutes(10))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("LOGIN")
                        .module("AUTH")
                        .entityType("User")
                        .entityId("1")
                        .description("Đăng nhập hệ thống thành công với quyền Quản trị viên")
                        .ipAddress("127.0.0.1")
                        .status("SUCCESS")
                        .details("{\"method\": \"PASSWORD\", \"userAgent\": \"Chrome / macOS\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusHours(2).minusMinutes(15))
                        .userId(2L)
                        .userEmail("sales@crm.com")
                        .userName("Trần Minh")
                        .userRole("SALES")
                        .action("CREATE")
                        .module("CUSTOMER")
                        .entityType("Customer")
                        .entityId("18")
                        .description("Tạo mới hồ sơ khách hàng doanh nghiệp: Công ty Cổ phần Công nghệ STAPlus")
                        .ipAddress("14.161.22.105")
                        .status("SUCCESS")
                        .details("{\"company\": \"STAPlus\", \"contactPerson\": \"Trần Minh Hoàng\", \"taxCode\": \"0109988776\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusHours(3).minusMinutes(30))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("IMPORT")
                        .module("LEAD")
                        .entityType("LeadBatch")
                        .entityId("BATCH-01")
                        .description("Import thành công 15 khách hàng tiềm năng từ file danh sách khách hàng hội thảo.csv")
                        .ipAddress("127.0.0.1")
                        .status("SUCCESS")
                        .details("{\"source\": \"EVENT\", \"fileName\": \"hoi-thao-crm.csv\", \"totalRows\": 15}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusHours(4).minusMinutes(5))
                        .userId(4L)
                        .userEmail("truc@crm.com")
                        .userName("Phạm Bảo Trúc")
                        .userRole("SALES")
                        .action("UPDATE")
                        .module("DEAL")
                        .entityType("Deal")
                        .entityId("104")
                        .description("Chuyển giai đoạn cơ hội 'Gói CRM Enterprise 50 Users' sang Đàm phán (Negotiation)")
                        .ipAddress("171.244.11.89")
                        .status("SUCCESS")
                        .details("{\"oldStage\": \"PROPOSAL\", \"newStage\": \"NEGOTIATION\", \"value\": 150000000}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusHours(5).minusMinutes(45))
                        .userId(null)
                        .userEmail("unknown@attacker.com")
                        .userName("Khách vãng lai")
                        .userRole("GUEST")
                        .action("LOGIN")
                        .module("AUTH")
                        .entityType("User")
                        .entityId(null)
                        .description("Đăng nhập thất bại: Tài khoản không tồn tại hoặc sai mật khẩu")
                        .ipAddress("45.133.1.20")
                        .status("FAILED")
                        .details("{\"reason\": \"Bad credentials\", \"targetEmail\": \"unknown@attacker.com\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusDays(1).minusHours(2))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("UPDATE")
                        .module("CUSTOMER")
                        .entityType("Customer")
                        .entityId("12")
                        .description("Nâng hạng phân nhóm khách hàng 'Tập đoàn Hòa Phát' lên mức VIP")
                        .ipAddress("127.0.0.1")
                        .status("SUCCESS")
                        .details("{\"oldTier\": \"STANDARD\", \"newTier\": \"VIP\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusDays(1).minusHours(5))
                        .userId(2L)
                        .userEmail("sales@crm.com")
                        .userName("Trần Minh")
                        .userRole("SALES")
                        .action("DELETE")
                        .module("LEAD")
                        .entityType("Lead")
                        .entityId("29")
                        .description("Xóa lead trùng lặp: Nguyễn Văn Thắng (SĐT: 0912999888)")
                        .ipAddress("14.161.22.105")
                        .status("SUCCESS")
                        .details("{\"deletedLeadId\": 29, \"reason\": \"Duplicate phone number\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusDays(2).minusHours(1))
                        .userId(1L)
                        .userEmail("admin@crm.local")
                        .userName("Quản trị viên")
                        .userRole("ADMIN")
                        .action("STATUS_CHANGE")
                        .module("USER")
                        .entityType("User")
                        .entityId("7")
                        .description("Kích hoạt và phê duyệt tài khoản mới cho nhân viên Bùi Hoàng Nam")
                        .ipAddress("127.0.0.1")
                        .status("SUCCESS")
                        .details("{\"previousStatus\": \"PENDING\", \"newStatus\": \"ACTIVE\"}")
                        .build(),

                AuditLog.builder()
                        .timestamp(now.minusDays(2).minusHours(4))
                        .userId(null)
                        .userEmail("system@crm.internal")
                        .userName("Hệ thống Webhook")
                        .userRole("SYSTEM")
                        .action("CREATE")
                        .module("LEAD")
                        .entityType("Lead")
                        .entityId("38")
                        .description("Tiếp nhận Lead mới tự động từ chiến dịch Facebook Ads: Trần Bảo Trâm")
                        .ipAddress("31.13.65.1")
                        .status("SUCCESS")
                        .details("{\"campaign\": \"Meta_Summer_Promo\", \"formId\": \"FB-LEAD-789\"}")
                        .build()
        );

        auditLogRepository.saveAll(seeds);
        log.info("Successfully seeded {} audit logs", seeds.size());
    }
}

