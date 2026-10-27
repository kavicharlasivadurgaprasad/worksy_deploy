package com.example.worsi_backend.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * Local-disk implementation. Fine for development and for a host with a PERSISTENT volume mounted at
 * app.storage.local.dir. On an ephemeral filesystem (many PaaS containers) files vanish on
 * restart/redeploy: use a persistent disk or provide another ImageStorage bean for cloud storage.
 */
@Component
public class LocalImageStorage implements ImageStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalImageStorage.class);

    private final Path root;

    public LocalImageStorage(@Value("${app.storage.local.dir:./uploads}") String dir) {
        this.root = Path.of(dir).toAbsolutePath().normalize();
    }

    @Override
    public void store(String key, byte[] data, String contentType) throws IOException {
        Path target = resolve(key);
        Files.createDirectories(target.getParent());
        // Write to a temp file then move, so a half-written image is never served.
        Path tmp = Files.createTempFile(target.getParent(), "upload-", ".tmp");
        try {
            Files.write(tmp, data);
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            Files.deleteIfExists(tmp);
        }
    }

    @Override
    public Resource load(String key) throws IOException {
        Path file = resolve(key);
        if (!Files.isRegularFile(file)) {
            throw new FileNotFoundException("Stored image is missing");
        }
        return new FileSystemResource(file);
    }

    @Override
    public void deleteQuietly(String key) {
        try {
            Files.deleteIfExists(resolve(key));
        } catch (Exception e) {
            log.warn("Could not delete stored image {}: {}", key, e.getClass().getSimpleName());
        }
    }

    /** Resolves a key under the storage root and refuses anything that escapes it. */
    private Path resolve(String key) throws IOException {
        Path resolved = root.resolve(key).normalize();
        if (!resolved.startsWith(root) || resolved.equals(root)) {
            throw new IOException("Invalid storage key");
        }
        return resolved;
    }
}
