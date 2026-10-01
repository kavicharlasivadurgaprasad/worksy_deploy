package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.ForgotPasswordRequest;
import com.example.worsi_backend.dto.GoogleAuthRequest;
import com.example.worsi_backend.dto.LoginRequest;
import com.example.worsi_backend.dto.LoginResponse;
import com.example.worsi_backend.dto.MessageResponse;
import com.example.worsi_backend.dto.OtpSentResponse;
import com.example.worsi_backend.dto.PhoneOtpSendRequest;
import com.example.worsi_backend.dto.PhoneOtpVerifyRequest;
import com.example.worsi_backend.dto.RegisterRequest;
import com.example.worsi_backend.dto.ResetPasswordRequest;
import com.example.worsi_backend.dto.UserResponse;
import com.example.worsi_backend.service.AuthService;
import com.example.worsi_backend.service.OtpService;
import com.example.worsi_backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, OtpService otpService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.otpService = otpService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/phone/send-otp")
    public ResponseEntity<OtpSentResponse> sendPhoneOtp(@Valid @RequestBody PhoneOtpSendRequest request) {
        authService.sendPhoneOtp(request.getPhone());
        OtpSentResponse response = new OtpSentResponse(
                "OTP sent.",
                otpService.getExpiryMinutes() * 60,
                otpService.getResendCooldownSeconds());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/phone/verify-otp")
    public ResponseEntity<LoginResponse> verifyPhoneOtp(@Valid @RequestBody PhoneOtpVerifyRequest request) {
        LoginResponse response = authService.loginOrRegisterWithPhone(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        LoginResponse response = authService.loginOrRegisterWithGoogle(request);
        return ResponseEntity.ok(response);
    }

    /** Always 200 with the same body, whether or not the email is registered. */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getEmail());
        return ResponseEntity.ok(new MessageResponse(
                "If an account exists for that email, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.ok(new MessageResponse(
                "Your password has been reset. You can now log in with your new password."));
    }
}
