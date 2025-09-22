package com.airaat.webchat.exception;

public class ValidationError extends RuntimeException {
    public ValidationError(String message) {
        super(message);
    }
}
