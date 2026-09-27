package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Address;
import com.example.worsi_backend.Entity.AddressLabel;
import lombok.Getter;

@Getter
public class AddressResponse {

    private final Long id;
    private final AddressLabel label;
    private final String street;
    private final String area;
    private final String city;
    private final String pincode;
    private final boolean defaultAddress;

    public AddressResponse(Address address) {
        this.id = address.getId();
        this.label = address.getLabel();
        this.street = address.getStreet();
        this.area = address.getArea();
        this.city = address.getCity();
        this.pincode = address.getPincode();
        this.defaultAddress = address.isDefaultAddress();
    }
}