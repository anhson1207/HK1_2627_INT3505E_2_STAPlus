package auth_service.exception;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestControllerAdvice
public class GlobalExceptionHandler {

 private ProblemDetail pd(HttpStatus s, String d) {
  ProblemDetail p = ProblemDetail.forStatusAndDetail(s, d);
  p.setType(URI.create("about:blank"));
  return p;
 }

 @ExceptionHandler(EmailAlreadyExistsException.class)
 ResponseEntity<ProblemDetail> email(EmailAlreadyExistsException e) {
  return ResponseEntity
          .status(409)
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(pd(HttpStatus.CONFLICT, e.getMessage()));
 }

 @ExceptionHandler(UsernameAlreadyExistsException.class)
 ResponseEntity<ProblemDetail> username(UsernameAlreadyExistsException e) {
  return ResponseEntity
          .status(409)
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(pd(HttpStatus.CONFLICT, e.getMessage()));
 }

 @ExceptionHandler(UserNotFoundException.class)
 ResponseEntity<ProblemDetail> notFound(UserNotFoundException e) {
  return ResponseEntity
          .status(404)
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(pd(HttpStatus.NOT_FOUND, e.getMessage()));
 }

 @ExceptionHandler({
         InvalidPasswordException.class,
         InvalidTokenException.class
 })
 ResponseEntity<ProblemDetail> unauthorized(RuntimeException e) {
  return ResponseEntity
          .status(401)
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(pd(HttpStatus.UNAUTHORIZED, e.getMessage()));
 }

 @ExceptionHandler({
         RoleNotAssignedException.class,
         ForbiddenException.class
 })
 ResponseEntity<ProblemDetail> forbidden(RuntimeException e) {
  return ResponseEntity
          .status(403)
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(pd(HttpStatus.FORBIDDEN, e.getMessage()));
 }

 @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
 ResponseEntity<ProblemDetail> responseStatus(org.springframework.web.server.ResponseStatusException e) {
  HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
  if (status == null) status = HttpStatus.BAD_REQUEST;
  ProblemDetail problem = pd(status, e.getReason());
  problem.setProperty("message", e.getReason());
  return ResponseEntity
          .status(e.getStatusCode())
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(problem);
 }

 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<ProblemDetail> validation(
         MethodArgumentNotValidException e
 ) {
  String message = e.getBindingResult().getFieldErrors().stream()
          .map(org.springframework.validation.FieldError::getDefaultMessage)
          .filter(msg -> msg != null && !msg.isBlank())
          .findFirst()
          .orElse("Dữ liệu nhập không hợp lệ");

  return ResponseEntity
          .status(422)
          .contentType(MediaType.APPLICATION_PROBLEM_JSON)
          .body(pd(
                  HttpStatus.UNPROCESSABLE_ENTITY,
                  message
          ));
 }
}