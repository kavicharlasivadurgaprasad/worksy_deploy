package com.example.worsi_backend.websocket;

import com.example.worsi_backend.security.JwtUtil;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Authenticates the WebSocket handshake before the connection is upgraded.
 * <p>
 * Browsers cannot attach custom headers (like "Authorization: Bearer ...") to a WebSocket
 * handshake, so the JWT is passed as a "token" query parameter instead: wss://host/ws/chat?token=...
 * The token is validated with the exact same JwtUtil used for REST, and the resolved user id is
 * stored as a session attribute - every later frame on this connection trusts that id as the
 * sender's identity, exactly like SecurityUtil does for REST requests. If the token is missing or
 * invalid the handshake is rejected (401) and no session is ever created.
 */
@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    public static final String USER_ID_ATTRIBUTE = "userId";

    private final JwtUtil jwtUtil;

    public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                    WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = extractToken(request);

        if (token == null || !jwtUtil.isTokenValid(token)) {
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }

        attributes.put(USER_ID_ATTRIBUTE, jwtUtil.extractUserId(token));
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }

    private String extractToken(ServerHttpRequest request) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String query = servletRequest.getServletRequest().getQueryString();
            if (query == null) return null;
            for (String param : query.split("&")) {
                int eq = param.indexOf('=');
                if (eq > 0 && param.substring(0, eq).equals("token")) {
                    return java.net.URLDecoder.decode(param.substring(eq + 1), java.nio.charset.StandardCharsets.UTF_8);
                }
            }
        }
        return null;
    }
}
