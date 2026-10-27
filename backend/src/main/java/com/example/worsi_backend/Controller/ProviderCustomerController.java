package com.example.worsi_backend.Controller;

import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.dto.ProviderCustomerResponse;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ProviderCustomerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The signed-in provider's own customers (the "Customers" dashboard section).
 *
 * The path deliberately has no provider id: the provider is whoever the JWT belongs to. It is also
 * deliberately NOT under /api/v1/providers/**, because SecurityConfig makes GET /providers/** public;
 * /api/v1/provider/** falls under anyRequest().authenticated().
 */
@RestController
@RequestMapping("/api/v1/provider")
public class ProviderCustomerController {

    private final ProviderCustomerService providerCustomerService;
    private final SecurityUtil securityUtil;

    public ProviderCustomerController(ProviderCustomerService providerCustomerService,
                                      SecurityUtil securityUtil) {
        this.providerCustomerService = providerCustomerService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/customers")
    public List<ProviderCustomerResponse> getMyCustomers() {
        if (!"PROVIDER".equals(securityUtil.getCurrentUserRole())) {
            throw new ForbiddenException("Only service providers can view their customers");
        }
        return providerCustomerService.getCustomersForProviderUser(securityUtil.getCurrentUserId());
    }
}
