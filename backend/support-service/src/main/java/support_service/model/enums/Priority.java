package support_service.model.enums;

public enum Priority {
    LOW(1),
    MEDIUM(2),
    HIGH(3);

    private final int rank;
    Priority(int rank){
        this.rank=rank;
    }

    public int getRank(){
        return this.rank;
    }
}
