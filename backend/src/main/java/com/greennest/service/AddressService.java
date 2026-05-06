package com.greennest.service;

import com.greennest.dto.AddressRequest;
import com.greennest.model.Address;
import com.greennest.model.User;
import com.greennest.repository.AddressRepository;
import com.greennest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getUserAddresses(String email) {
        User user = getUser(email);
        return addressRepository.findByUserId(user.getId())
                .stream().map(this::toMap).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> addAddress(String email, AddressRequest req) {
        User user = getUser(email);

        // If this is set as default, unset others
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.findByUserId(user.getId()).forEach(a -> {
                a.setIsDefault(false);
                addressRepository.save(a);
            });
        }

        Address address = Address.builder()
                .user(user)
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .street(req.getStreet())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .country(req.getCountry() != null ? req.getCountry() : "India")
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .type(req.getType() != null
                        ? Address.AddressType.valueOf(req.getType().toUpperCase())
                        : Address.AddressType.HOME)
                .build();

        return toMap(addressRepository.save(address));
    }

    @Transactional
    public Map<String, Object> setDefaultAddress(String email, Long addressId) {
        User user = getUser(email);
        // Unset all defaults first
        addressRepository.findByUserId(user.getId()).forEach(a -> {
            a.setIsDefault(false);
            addressRepository.save(a);
        });
        // Set the selected one as default
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        address.setIsDefault(true);
        return toMap(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = getUser(email);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        addressRepository.delete(address);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Map<String, Object> toMap(Address a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",        a.getId());
        m.put("fullName",  a.getFullName());
        m.put("phone",     a.getPhone());
        m.put("street",    a.getStreet());
        m.put("city",      a.getCity());
        m.put("state",     a.getState());
        m.put("pincode",   a.getPincode());
        m.put("country",   a.getCountry());
        m.put("type",      a.getType().name());
        m.put("isDefault", a.getIsDefault());
        return m;
    }
}
