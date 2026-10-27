package com.example.worsi_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/** Body of PUT /users/{userId}/provider-profile/services/prices: several prices saved in one transaction. */
@Getter
@Setter
public class ProviderServicePricesRequest {

    @NotEmpty(message = "Send at least one price")
    @Valid
    private List<ProviderServicePriceEntry> prices;
}
