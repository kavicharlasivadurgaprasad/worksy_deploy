package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.ProviderServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderServicePriceRepository extends JpaRepository<ProviderServicePrice, Long> {

    Optional<ProviderServicePrice> findByProviderIdAndServiceId(Long providerId, Long serviceId);

    /** Every price one provider has configured, with the service loaded (no N+1). */
    @Query("select p from ProviderServicePrice p join fetch p.service s where p.provider.id = :providerId order by s.title")
    List<ProviderServicePrice> findAllForProvider(@Param("providerId") Long providerId);

    /** Prices of several providers at once. Callers must not pass an empty collection. */
    @Query("select p from ProviderServicePrice p join fetch p.service s where p.provider.id in :providerIds order by s.title")
    List<ProviderServicePrice> findAllForProviders(@Param("providerIds") Collection<Long> providerIds);

    /** Per catalogue service: the lowest price any provider charges and how many providers have set one. */
    interface ServicePriceSummaryRow {
        Long getServiceId();
        BigDecimal getMinPrice();
        Long getProviderCount();
    }

    @Query("select p.service.id as serviceId, min(p.price) as minPrice, count(p) as providerCount "
            + "from ProviderServicePrice p group by p.service.id")
    List<ServicePriceSummaryRow> summarizeByService();
}
