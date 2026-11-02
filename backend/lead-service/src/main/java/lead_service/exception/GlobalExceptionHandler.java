package lead_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> notFound(
            ResourceNotFoundException ex
    ) {
        return problem(
                HttpStatus.NOT_FOUND,
                "Resource not found",
                ex.getMessage()
        );
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ProblemDetail> badRequest(
            BadRequestException ex
    ) {
        return problem(
                HttpStatus.BAD_REQUEST,
                "Bad request",
                ex.getMessage()
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> typeMismatch(
            MethodArgumentTypeMismatchException ex
    ) {
        return problem(
                HttpStatus.BAD_REQUEST,
                "Bad request",
                "Invalid value for parameter: " + ex.getName()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> validation(
            MethodArgumentNotValidException ex
    ) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Request validation failed"
        );

        pd.setTitle("Validation failed");
        pd.setType(URI.create("urn:problem:validation"));

        Map<String, String> errors = new LinkedHashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(e ->
                        errors.putIfAbsent(
                                e.getField(),
                                e.getDefaultMessage()
                        )
                );

        ex.getBindingResult()
                .getGlobalErrors()
                .forEach(e ->
                        errors.putIfAbsent(
                                e.getObjectName(),
                                e.getDefaultMessage()
                        )
                );

        pd.setProperty("errors", errors);

        return ResponseEntity
                .unprocessableEntity()
                .body(pd);
    }

    private ResponseEntity<ProblemDetail> problem(
            HttpStatus status,
            String title,
            String detail
    ) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                status,
                detail
        );

        pd.setTitle(title);
        pd.setType(
                URI.create("urn:problem:" + status.value())
        );

        return ResponseEntity
                .status(status)
                .body(pd);
    }
}