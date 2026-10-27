package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserId(Long userId);

    Optional<Address> findFirstByUserIdAndDefaultAddressTrueOrderByIdAsc(Long userId);

    Optional<Address> findFirstByUserIdOrderByIdAsc(Long userId);
}