package com.greennest.controller;

import com.greennest.dto.AddressRequest;
import com.greennest.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // GET /api/addresses
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAddresses(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user.getUsername()));
    }

    // POST /api/addresses
    @PostMapping
    public ResponseEntity<Map<String, Object>> addAddress(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(addressService.addAddress(user.getUsername(), req));
    }

    // PATCH /api/addresses/{id}/default
    @PatchMapping("/{id}/default")
    public ResponseEntity<Map<String, Object>> setDefault(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefaultAddress(user.getUsername(), id));
    }

    // DELETE /api/addresses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAddress(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        addressService.deleteAddress(user.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
    }
}
