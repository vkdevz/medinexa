package com.velocura.controller;

import com.velocura.service.GeminiAiService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class LabReportController {

    private final GeminiAiService geminiAiService;

    @Autowired
    public LabReportController(GeminiAiService geminiAiService) {
        this.geminiAiService = geminiAiService;
    }

    @PostMapping("/analyze-report")
    public ResponseEntity<?> analyzeReport(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Uploaded file is empty."));
        }

        String contentType = file.getContentType();
        String textContent = "";

        if (contentType != null && contentType.equalsIgnoreCase("application/pdf")) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                textContent = stripper.getText(document);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Error parsing PDF report: " + e.getMessage()));
            }
        } else if (contentType != null && (contentType.startsWith("text/") || contentType.equalsIgnoreCase("application/json") || contentType.equalsIgnoreCase("text/plain"))) {
            try {
                textContent = new String(file.getBytes());
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Error reading file content: " + e.getMessage()));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Unsupported file format. Please upload a PDF or plain text medical report."));
        }

        if (textContent.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Could not extract any readable text from the uploaded file."));
        }

        // Call Gemini to analyze report text content
        String analysisHtml = geminiAiService.analyzeLabReport(textContent);

        return ResponseEntity.ok(Map.of("analysis", analysisHtml));
    }
}
