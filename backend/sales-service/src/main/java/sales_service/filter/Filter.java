package sales_service.filter;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.domain.Specification;
import sales_service.model.Deal;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Filter {
    public static Specification<Deal> filter(

            Long salesId,
            String owner,
            Double minAmount,
            Double maxAmount,
            String stage,
            LocalDateTime createdAfter,
            LocalDateTime createdBefore

    ) {
        return (root, query, cb) -> {
            List<Predicate> predicateList = new ArrayList<>();

            if(salesId != null){
                predicateList.add(cb.equal(root.get("salesId"), salesId));
            }

            if(owner != null){
                predicateList.add(cb.equal(root.get("owner"), owner));
            }

            if(minAmount != null){
                predicateList.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }

            if(maxAmount != null){
                predicateList.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            if(stage != null){
                predicateList.add(cb.equal(root.get("stage"), stage));
            }

            if(createdAfter != null){
                predicateList.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdAfter));
            }

            if(createdBefore != null){
                predicateList.add(cb.lessThanOrEqualTo(root.get("createdAt"), createdBefore));
            }

            return cb.and(predicateList.toArray(new Predicate[0]));


        };
    }
}
