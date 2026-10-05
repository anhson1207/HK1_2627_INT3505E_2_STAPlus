package sales_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DealRequest {

    private String owner;


    private Double amount;


    private String stage;

    public DealRequest(){

    }

    public DealRequest(String owner, Double amount, String stage){
        this.owner = owner;
        this.amount = amount;
        this.stage = stage;
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
