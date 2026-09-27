package com.example.worsi_backend.service;

import com.example.worsi_backend.dto.AddressRequest;
import com.example.worsi_backend.dto.AddressResponse;
import com.example.worsi_backend.Entity.Address;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.ForbiddenException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.repository.AddressRepository;
import com.example.worsi_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Address address = new Address();
        address.setUser(user);
        address.setLabel(request.getLabel());
        address.setStreet(request.getStreet());
        address.setArea(request.getArea());
        address.setCity(request.getCity());
        address.setPincode(request.getPincode());
        // First address is always the default; an explicit default un-defaults the others.
        boolean makeDefault = request.isDefaultAddress() || addressRepository.findByUserId(userId).isEmpty();
        if (makeDefault) {
            addressRepository.findByUserId(userId).forEach(a -> {
                if (a.isDefaultAddress()) {
                    a.setDefaultAddress(false);
                    addressRepository.save(a);
                }
            });
        }
        address.setDefaultAddress(makeDefault);

        Address saved = addressRepository.save(address);
        return new AddressResponse(saved);
    }

    public List<AddressResponse> getAddressesForUser(Long userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(AddressResponse::new)
                .toList();
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own addresses");
        }
        // Throws DataIntegrityViolationException (-> 409) if a booking still references it.
        addressRepository.delete(address);
    }
}
