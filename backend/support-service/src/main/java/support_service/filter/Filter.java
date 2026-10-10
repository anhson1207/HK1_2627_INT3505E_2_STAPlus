package support_service.filter;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.domain.Specification;
import support_service.model.Ticket;
import support_service.model.enums.Priority;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Filter {
    public static Specification<Ticket> filter(
            Priority priority,
            String status,
            Long salesId,
            Long supportId,
            LocalDateTime createdAfter,
            LocalDateTime createdBefore,
            String sortedBy,
            String order
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicateList = new ArrayList<>();

            if(priority != null){
                predicateList.add(cb.equal(root.get("priority"), priority));
            }

            if(status != null){
                predicateList.add(cb.equal(root.get("status"), status));
            }

            if(salesId != null){
                predicateList.add(cb.equal(root.get("salesId"), salesId));
            }

            if(supportId != null){
                predicateList.add(cb.equal(root.get("supportId"), supportId));
            }

            if(createdAfter != null){
                predicateList.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdAfter));
            }

            if(createdBefore != null){
                predicateList.add(cb.lessThanOrEqualTo(root.get("createdAt"), createdBefore));
            }

            boolean isCountQuery =
                    Long.class.equals(query.getResultType())
                            || long.class.equals(query.getResultType());

            if ("priority".equalsIgnoreCase(sortedBy)
                    && !isCountQuery) {

                Expression<Integer> priorityRank =
                        cb.<Priority, Integer>selectCase(
                                        root.<Priority>get("priority")
                                )
                                .when(Priority.LOW, Priority.LOW.getRank())
                                .when(Priority.MEDIUM, Priority.MEDIUM.getRank())
                                .when(Priority.HIGH, Priority.HIGH.getRank())
                                .otherwise(Integer.MAX_VALUE);

                if ("desc".equalsIgnoreCase(order)) {
                    query.orderBy(cb.desc(priorityRank));
                } else {
                    query.orderBy(cb.asc(priorityRank));
                }
            }

            return cb.and(predicateList.toArray(new Predicate[0]));


        };
    }
}
