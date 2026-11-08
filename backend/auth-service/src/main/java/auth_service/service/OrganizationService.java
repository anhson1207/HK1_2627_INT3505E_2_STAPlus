package auth_service.service;

import auth_service.dto.request.InitializeSetupRequest;
import auth_service.dto.request.UpdateOrganizationRequest;
import auth_service.dto.response.OrganizationResponse;
import auth_service.dto.response.SetupStatusResponse;
import auth_service.entity.Organization;
import auth_service.entity.User;

import java.util.Optional;

public interface OrganizationService {

    SetupStatusResponse getSetupStatus();

    OrganizationResponse getOrganization();

    Optional<Organization> getRawOrganization();

    OrganizationResponse updateOrganization(UpdateOrganizationRequest request, User currentUser);

    OrganizationResponse initializeSetup(InitializeSetupRequest request);

    boolean isOwner(Long userId);
}
