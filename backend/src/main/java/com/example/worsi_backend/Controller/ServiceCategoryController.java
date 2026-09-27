package com.example.worsi_backend.Controller;
import com.example.worsi_backend.Entity.ServiceCategory;
import com.example.worsi_backend.service.ServiceCategoryService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceCategoryController {

    private final ServiceCategoryService service;

    public ServiceCategoryController(ServiceCategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceCategory> getAll() {
        return service.getAllCategories();
    }
}