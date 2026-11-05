package sales_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class DealControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testCreateAndGetDeal() throws Exception {
        String json = """
            {
                "dealName": "Big Enterprise CRM Deal",
                "owner": "Son",
                "amount": 250000000.0,
                "stage": "NEW"
            }
            """;

        mockMvc.perform(post("/deals")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dealName").value("Big Enterprise CRM Deal"))
                .andExpect(jsonPath("$.stage").value("NEW"));

        mockMvc.perform(get("/deals")
                        .header("X-User-Id", "1")
                        .header("X-User-Role", "SALES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void testPipelineSummaryAndForecast() throws Exception {
        mockMvc.perform(get("/deals/pipeline/summary")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/deals/forecast")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPipelineValue").isNumber())
                .andExpect(jsonPath("$.weightedForecastValue").isNumber());
    }
}
