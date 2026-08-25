package com.example.grievance.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SpeechService {

    private final String apiKey;

    public SpeechService(@Value("${gemini.api-key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public String transcribe(MultipartFile file) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        byte[] audioBytes = file.getBytes();

        String mimeType = file.getContentType();

        if (mimeType == null || mimeType.isBlank()) {
            mimeType = "audio/wav";
        }

        Part audioPart = Part.fromBytes(
                audioBytes,
                mimeType
        );

        Part instruction = Part.fromText(
                """
                Generate an accurate transcript of the speech in this audio.

                Requirements:
                - Preserve the original language.
                - Do not translate.
                - Do not summarize.
                - Do not add explanations.
                - Return only the spoken transcript.
                """
        );

        Content content = Content.fromParts(
                instruction,
                audioPart
        );

        GenerateContentResponse response =
                Client.builder()
                        .apiKey(apiKey)
                        .build()
                        .models.generateContent(
                        "gemini-3.6-flash",
                        content,
                        GenerateContentConfig.builder().build()
                );

        return response.text();
    }
}
