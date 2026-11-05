package analytics_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class AnalyticsControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testDashboardStats() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard-stats?range=30d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").isNumber())
                .andExpect(jsonPath("$.totalDeals").isNumber());
    }

    @Test
    void testRevenueAndGrowth() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/revenue?range=1y"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/analytics/customer-growth?range=1y"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testConversionFunnelAndPerformance() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/conversion-funnel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/analytics/sales-performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testLeadSourcesAndDealStages() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/lead-sources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/analytics/deal-stages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testTopCustomersAndActivities() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/top-customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/analytics/recent-activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/analytics/ticket-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statuses").isArray());
    }
}
