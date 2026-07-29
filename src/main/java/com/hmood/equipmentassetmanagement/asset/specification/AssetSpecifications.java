package com.hmood.equipmentassetmanagement.asset.specification;

import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class AssetSpecifications {

    private AssetSpecifications() {
    }

    public static Specification<Asset> withFilters(String search, AssetStatus status, String category) {

        return new Specification<Asset>() {

            @Override
            public Predicate toPredicate(Root<Asset> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {

                List<Predicate> predicates = new ArrayList<>();

                if (search != null && !search.isBlank()) {

                    String searchPattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";

                    Predicate searchPredicate = criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("name")), searchPattern),

                            criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("category")), searchPattern),

                            criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("serialNumber")), searchPattern));

                    predicates.add(searchPredicate);
                }

                if (status != null) {

                    Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), status);

                    predicates.add(statusPredicate);
                }

                if (category != null && !category.isBlank()) {

                    String normalizedCategory = category.trim().toLowerCase(Locale.ROOT);

                    Predicate categoryPredicate = criteriaBuilder.equal(criteriaBuilder.lower(root.<String>get("category")), normalizedCategory);

                    predicates.add(categoryPredicate);
                }

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            }
        };
    }
}