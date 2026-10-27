package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.ProfileResponse;
import com.example.worsi_backend.dto.UpdateProfileRequest;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

/**
 * Edit Profile for the signed-in user. There is no user id in any /profile/me URL or body: the user
 * is always the one identified by the JWT, so one user can never read or edit another's profile.
 * CORS is handled globally in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1")
public class ProfileController {

    private final ProfileService profileService;
    private final SecurityUtil securityUtil;

    public ProfileController(ProfileService profileService, SecurityUtil securityUtil) {
        this.profileService = profileService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/profile/me")
    public ProfileResponse getMyProfile() {
        return profileService.getMyProfile(securityUtil.getCurrentUserId());
    }

    @PutMapping("/profile/me")
    public ProfileResponse updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateMyProfile(securityUtil.getCurrentUserId(), request);
    }

    /** multipart/form-data with one file part named "image" (JPEG / PNG / WEBP, max 2 MB). */
    @PostMapping(value = "/profile/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileResponse uploadAvatar(@RequestPart(value = "image", required = false) MultipartFile image) {
        return profileService.uploadAvatar(securityUtil.getCurrentUserId(), image);
    }

    @DeleteMapping("/profile/me/avatar")
    public ProfileResponse removeAvatar() {
        return profileService.removeAvatar(securityUtil.getCurrentUserId());
    }

    /**
     * Public (no JWT) so a plain &lt;img src&gt; can show it in headers, chat and listings. It only ever
     * serves the picture the user chose to upload as their profile photo, under a random server-side key.
     */
    @GetMapping("/users/{userId}/avatar")
    public ResponseEntity<Resource> getAvatar(@PathVariable Long userId) {
        ProfileService.AvatarImage avatar = profileService.loadAvatar(userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(avatar.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("avatar-" + userId).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .body(avatar.resource());
    }
}
