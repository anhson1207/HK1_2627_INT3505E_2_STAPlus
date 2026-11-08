package auth_service.controller;

import auth_service.dto.request.InitializeSetupRequest;
import auth_service.dto.response.OrganizationResponse;
import auth_service.dto.response.SetupStatusResponse;
import auth_service.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/setup")
@RequiredArgsConstructor
public class SetupController {

    private final OrganizationService organizationService;

    @GetMapping("/status")
    public ResponseEntity<SetupStatusResponse> getSetupStatus() {
        return ResponseEntity.ok(organizationService.getSetupStatus());
    }

    @PostMapping("/initialize")
    public ResponseEntity<OrganizationResponse> initializeSetup(
            @Valid @RequestBody InitializeSetupRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(organizationService.initializeSetup(request));
    }
}
