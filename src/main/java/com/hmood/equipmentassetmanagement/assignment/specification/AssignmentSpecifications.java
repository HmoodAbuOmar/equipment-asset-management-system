package com.hmood.equipmentassetmanagement.assignment.specification;

import com.hmood.equipmentassetmanagement.assignment.model.Assignment;
import com.hmood.equipmentassetmanagement.assignment.model.AssignmentStatus;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class AssignmentSpecifications {

    private AssignmentSpecifications() {
    }

    public static Specification<Assignment> withFilters(String search, AssignmentStatus status) {
        return (root, query, criteriaBuilder) -> {
            var asset = root.join("asset", JoinType.INNER);
            var user = root.join("user", JoinType.INNER);
            var predicate = criteriaBuilder.conjunction();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(asset.<String>get("name")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(asset.<String>get("serialNumber")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(user.<String>get("name")), pattern)
                ));
            }

            if (status == AssignmentStatus.ACTIVE) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.isNull(root.get("returnedAt")));
            } else if (status == AssignmentStatus.RETURNED) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.isNotNull(root.get("returnedAt")));
            }

            return predicate;
        };
    }
}
