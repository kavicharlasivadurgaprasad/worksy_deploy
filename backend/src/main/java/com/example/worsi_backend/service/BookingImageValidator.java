package com.example.worsi_backend.service;

import com.example.worsi_backend.Exception.ImageUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Server-side validation of uploaded images. The client's Content-Type and filename are NOT trusted:
 * the type is decided from the file's magic bytes. Only JPEG, PNG and WEBP are accepted.
 */
@Component
public class BookingImageValidator {

    /** An image that passed validation; {@code data} is what gets stored. */
    public record ValidatedImage(byte[] data, String contentType, String extension, String displayName) {}

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    @Value("${app.booking.images.max-count:5}")
    private int maxCount;

    @Value("${app.booking.images.max-bytes:5242880}")
    private long maxBytes;

    public List<ValidatedImage> validate(List<MultipartFile> files) {
        List<MultipartFile> present = new ArrayList<>();
        if (files != null) {
            for (MultipartFile f : files) {
                // A browser can send an empty part when no file is chosen; ignore that, reject real empty files.
                if (f == null || (f.isEmpty() && (f.getOriginalFilename() == null || f.getOriginalFilename().isBlank()))) {
                    continue;
                }
                present.add(f);
            }
        }

        if (present.size() > maxCount) {
            throw new ImageUploadException(HttpStatus.BAD_REQUEST,
                    "You can attach at most " + maxCount + " images to a booking");
        }

        List<ValidatedImage> result = new ArrayList<>();
        for (MultipartFile file : present) {
            result.add(validateOne(file));
        }
        return result;
    }

    private ValidatedImage validateOne(MultipartFile file) {
        String displayName = sanitizeName(file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new ImageUploadException(HttpStatus.BAD_REQUEST, "\"" + displayName + "\" is empty");
        }
        if (file.getSize() > maxBytes) {
            throw new ImageUploadException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "\"" + displayName + "\" is larger than " + (maxBytes / (1024 * 1024)) + " MB");
        }

        String ext = extensionOf(displayName);
        if (ext != null && !ALLOWED_EXTENSIONS.contains(ext)) {
            throw unsupported(displayName);
        }

        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw new ImageUploadException(HttpStatus.BAD_REQUEST, "\"" + displayName + "\" could not be read");
        }
        if (data.length > maxBytes) {
            throw new ImageUploadException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "\"" + displayName + "\" is larger than " + (maxBytes / (1024 * 1024)) + " MB");
        }

        if (isJpeg(data)) return new ValidatedImage(data, "image/jpeg", "jpg", displayName);
        if (isPng(data)) return new ValidatedImage(data, "image/png", "png", displayName);
        if (isWebp(data)) return new ValidatedImage(data, "image/webp", "webp", displayName);
        throw unsupported(displayName);
    }

    private ImageUploadException unsupported(String name) {
        return new ImageUploadException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "\"" + name + "\" is not a valid JPEG, PNG or WEBP image");
    }

    private static boolean isJpeg(byte[] d) {
        return d.length > 3 && (d[0] & 0xFF) == 0xFF && (d[1] & 0xFF) == 0xD8 && (d[2] & 0xFF) == 0xFF;
    }

    private static boolean isPng(byte[] d) {
        byte[] sig = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
        if (d.length < sig.length) return false;
        for (int i = 0; i < sig.length; i++) if (d[i] != sig[i]) return false;
        return true;
    }

    private static boolean isWebp(byte[] d) {
        // "RIFF" <4-byte size> "WEBP"
        return d.length > 12
                && d[0] == 'R' && d[1] == 'I' && d[2] == 'F' && d[3] == 'F'
                && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P';
    }

    /** Strips any path, control characters and quotes, and caps the length. Display only, never a path. */
    static String sanitizeName(String raw) {
        if (raw == null || raw.isBlank()) return "image";
        String name = raw.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1);
        name = name.replaceAll("[\\p{Cntrl}\"<>|:*?]", "").trim();
        if (name.isEmpty()) return "image";
        return name.length() > 100 ? name.substring(name.length() - 100) : name;
    }

    private static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 || dot == name.length() - 1 ? null : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
