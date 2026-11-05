package sales_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DealRequest {

    private String dealName;

    private String owner;


    private Double amount;


    private String stage;

    public DealRequest(){

    }

    public DealRequest(String dealName, String owner, Double amount, String stage){
        this.dealName = dealName;
        this.owner = owner;
        this.amount = amount;
        this.stage = stage;
    }

    public String getDealName() {
        return dealName;
    }

    public void setDealName(String dealName) {
        this.dealName = dealName;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }
}
