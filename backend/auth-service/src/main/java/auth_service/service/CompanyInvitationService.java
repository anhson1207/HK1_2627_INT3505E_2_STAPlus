package auth_service.service;

import auth_service.dto.request.CompanyInvitationRequest;
import auth_service.dto.response.CompanyInvitationResponse;
import auth_service.dto.response.ValidateInvitationResponse;
import auth_service.entity.CompanyInvitation;
import auth_service.entity.User;

import java.util.List;

public interface CompanyInvitationService {

    CompanyInvitationResponse createInvitation(CompanyInvitationRequest request, User currentUser);

    List<CompanyInvitationResponse> listInvitations();

    CompanyInvitationResponse revokeInvitation(Long id, User currentUser);

    ValidateInvitationResponse validateCode(String code);

    CompanyInvitation getValidInvitationByCode(String code);
}
