package com.example.worsi_backend.Controller;

import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.dto.AddressRequest;
import com.example.worsi_backend.dto.AddressResponse;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/{userId}/addresses")
@CrossOrigin(origins = "http://localhost:3000")
public class AddressController {

    private final AddressService addressService;
    private final SecurityUtil securityUtil;

    public AddressController(AddressService addressService, SecurityUtil securityUtil) {
        this.addressService = addressService;
        this.securityUtil = securityUtil;
    }

    @PostMapping
    public ResponseEntity<AddressResponse> create(@PathVariable Long userId,
                                                  @Valid @RequestBody AddressRequest request) {
        if (!userId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only manage your own addresses");
        }
        AddressResponse response = addressService.createAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<AddressResponse> getAll(@PathVariable Long userId) {
        if (!userId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only view your own addresses");
        }
        return addressService.getAddressesForUser(userId);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> delete(@PathVariable Long userId, @PathVariable Long addressId) {
        if (!userId.equals(securityUtil.getCurrentUserId())) {
            throw new ForbiddenException("You can only manage your own addresses");
        }
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}
