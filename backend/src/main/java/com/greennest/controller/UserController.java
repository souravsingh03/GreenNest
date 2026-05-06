package com.greennest.controller;

import com.greennest.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/user/profile
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.getProfile(user.getUsername()));
    }

    // PATCH /api/user/profile  { "name": "New Name" }
    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateName(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateName(user.getUsername(), body.get("name")));
    }

    // POST /api/user/change-password
    // { "oldPassword": "old123", "newPassword": "new456" }
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.changePassword(
                user.getUsername(),
                body.get("oldPassword"),
                body.get("newPassword")));
    }
}
