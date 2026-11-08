package auth_service.service;

import auth_service.dto.request.ApproveJoinRequest;
import auth_service.dto.request.RejectJoinRequest;
import auth_service.dto.response.JoinRequestResponse;
import auth_service.dto.response.JoinStatusResponse;
import auth_service.entity.JoinRequestStatus;
import auth_service.entity.User;

import java.util.List;

public interface JoinRequestService {

    List<JoinRequestResponse> getJoinRequests(JoinRequestStatus status);

    JoinRequestResponse getJoinRequest(Long id);

    JoinRequestResponse approveJoinRequest(Long id, ApproveJoinRequest request, User admin);

    JoinRequestResponse rejectJoinRequest(Long id, RejectJoinRequest request, User admin);

    JoinStatusResponse getCurrentUserJoinStatus(User user);
}
