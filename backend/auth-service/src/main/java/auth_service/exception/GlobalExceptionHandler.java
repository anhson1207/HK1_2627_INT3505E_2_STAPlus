package auth_service.exception;

import auth_service.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(
            EmailAlreadyExistsException.class
    )
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleEmailExists(
            EmailAlreadyExistsException ex
    ) {

        return ErrorResponse.builder()
                .message(ex.getMessage())
                .status(400)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @ExceptionHandler(
            UserNotFoundException.class
    )
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFound(
            UserNotFoundException ex
    ) {

        return ErrorResponse.builder()
                .message(ex.getMessage())
                .status(404)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @ExceptionHandler(
            InvalidPasswordException.class
    )
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleInvalidPassword(
            InvalidPasswordException ex
    ) {

        return ErrorResponse.builder()
                .message(ex.getMessage())
                .status(401)
                .timestamp(LocalDateTime.now())
                .build();
    }

}