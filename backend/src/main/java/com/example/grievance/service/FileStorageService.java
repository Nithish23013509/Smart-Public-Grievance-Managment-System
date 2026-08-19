package com.example.grievance.service;

import com.example.grievance.exception.InvalidFileException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    private Path complaintsUploadPath;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".exe", ".sh", ".bat", ".php", ".jsp", ".cmd", ".ps1"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostConstruct
    public void init() {
        complaintsUploadPath = Paths.get(uploadDir, "complaints").toAbsolutePath().normalize();
        try {
            Files.createDirectories(complaintsUploadPath);
            log.info("Upload directory created: {}", complaintsUploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    /**
     * Save an uploaded image file and return its relative path.
     */
    public String saveComplaintImage(MultipartFile file) {
        validateFile(file);

        // Generate a unique server-side filename (never trust original)
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "image"
        );
        String extension = getFileExtension(originalFilename);
        String generatedFilename = UUID.randomUUID().toString() + extension;

        try {
            // Prevent path traversal
            Path targetLocation = complaintsUploadPath.resolve(generatedFilename).normalize();
            if (!targetLocation.startsWith(complaintsUploadPath)) {
                throw new InvalidFileException("Invalid file path detected");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("File saved: {}", generatedFilename);

            return "/uploads/complaints/" + generatedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidFileException(
                    "Invalid file type. Allowed: JPEG, PNG, WebP. Got: " + contentType);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = getFileExtension(originalFilename).toLowerCase();
            if (BLOCKED_EXTENSIONS.contains(extension)) {
                throw new InvalidFileException("File extension not allowed: " + extension);
            }
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            return filename.substring(dotIndex);
        }
        return ".jpg"; // default
    }
}
