package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceCategoryService {

    private final ServiceCategoryRepository repository;

    public ServiceCategoryService(ServiceCategoryRepository repository) {
        this.repository = repository;
    }

    public List<ServiceCategory> getAllCategories() {
        return repository.findAll();
    }
}