package com.crms.app.exception;

public class CrmsException extends RuntimeException {
    public CrmsException() {
        super();
    }

    public CrmsException(String message) {
        super(message);
    }

    public CrmsException(String message, Throwable cause) {
        super(message, cause);
    }
}
