package com.example.worsi_backend.service.oidc;

import com.example.worsi_backend.Exception.UnauthorizedException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import java.net.URI;
import java.util.Date;
import java.util.List;

/**
 * Verifies a provider's Sign-In ID token (e.g. Google): checks the RS256 signature against the
 * provider's published JWKS, then checks issuer, audience and expiry. This is the standard way to
 * accept "Sign in with Google" on a backend without a full OAuth2 client library - it is the same
 * mechanism Spring Security's own oauth2-resource-server uses internally.
 *
 * One instance is created per provider (see GoogleAuthService) and reused for every request, so
 * the JWKS is fetched once and cached rather than refetched per login.
 */
public class OidcTokenVerifier {

    private final ConfigurableJWTProcessor<SecurityContext> processor;
    private final List<String> acceptableIssuers;
    private final String expectedAudience;
    private final String providerName;

    public OidcTokenVerifier(String jwksUrl, List<String> acceptableIssuers, String expectedAudience, String providerName) {
        this.acceptableIssuers = acceptableIssuers;
        this.expectedAudience = expectedAudience;
        this.providerName = providerName;
        try {
            JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(URI.create(jwksUrl).toURL());
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            DefaultJWTProcessor<SecurityContext> defaultProcessor = new DefaultJWTProcessor<>();
            defaultProcessor.setJWSKeySelector(keySelector);
            this.processor = defaultProcessor;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize " + providerName + " token verifier", e);
        }
    }

    public OidcIdentity verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException(providerName + " sign-in failed: missing token");
        }
        try {
            JWTClaimsSet claims = processor.process(idToken, null);

            String issuer = claims.getIssuer();
            if (issuer == null || !acceptableIssuers.contains(issuer)) {
                throw new UnauthorizedException(providerName + " sign-in failed: unexpected token issuer");
            }

            List<String> audience = claims.getAudience();
            if (audience == null || !audience.contains(expectedAudience)) {
                throw new UnauthorizedException(providerName + " sign-in failed: token was not issued for this app");
            }

            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.before(new Date())) {
                throw new UnauthorizedException(providerName + " sign-in failed: token expired");
            }

            String subject = claims.getSubject();
            if (subject == null || subject.isBlank()) {
                throw new UnauthorizedException(providerName + " sign-in failed: token has no subject");
            }

            String email = claims.getStringClaim("email");
            Object emailVerifiedClaim = claims.getClaim("email_verified");
            boolean emailVerified = Boolean.TRUE.equals(emailVerifiedClaim) || "true".equalsIgnoreCase(String.valueOf(emailVerifiedClaim));
            String name = claims.getStringClaim("name");

            return new OidcIdentity(subject, email, emailVerified, name);
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            throw new UnauthorizedException(providerName + " sign-in failed: invalid or tampered token");
        }
    }
}
