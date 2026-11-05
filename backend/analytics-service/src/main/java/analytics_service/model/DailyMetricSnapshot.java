package analytics_service.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "analytics_metric_snapshots")
public class DailyMetricSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_date", nullable = false, unique = true)
    private LocalDate metricDate;

    @Column(nullable = false)
    private Double revenue = 0.0;

    @Column(name = "won_deals", nullable = false)
    private Integer wonDeals = 0;

    @Column(name = "total_deals", nullable = false)
    private Integer totalDeals = 0;

    @Column(name = "total_leads", nullable = false)
    private Integer totalLeads = 0;

    @Column(name = "total_customers", nullable = false)
    private Integer totalCustomers = 0;

    @Column(name = "open_tickets", nullable = false)
    private Integer openTickets = 0;

    public DailyMetricSnapshot() {}

    public DailyMetricSnapshot(LocalDate metricDate, Double revenue, Integer wonDeals, Integer totalDeals, Integer totalLeads, Integer totalCustomers, Integer openTickets) {
        this.metricDate = metricDate;
        this.revenue = revenue;
        this.wonDeals = wonDeals;
        this.totalDeals = totalDeals;
        this.totalLeads = totalLeads;
        this.totalCustomers = totalCustomers;
        this.openTickets = openTickets;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getMetricDate() { return metricDate; }
    public void setMetricDate(LocalDate metricDate) { this.metricDate = metricDate; }

    public Double getRevenue() { return revenue; }
    public void setRevenue(Double revenue) { this.revenue = revenue; }

    public Integer getWonDeals() { return wonDeals; }
    public void setWonDeals(Integer wonDeals) { this.wonDeals = wonDeals; }

    public Integer getTotalDeals() { return totalDeals; }
    public void setTotalDeals(Integer totalDeals) { this.totalDeals = totalDeals; }

    public Integer getTotalLeads() { return totalLeads; }
    public void setTotalLeads(Integer totalLeads) { this.totalLeads = totalLeads; }

    public Integer getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Integer totalCustomers) { this.totalCustomers = totalCustomers; }

    public Integer getOpenTickets() { return openTickets; }
    public void setOpenTickets(Integer openTickets) { this.openTickets = openTickets; }
}
