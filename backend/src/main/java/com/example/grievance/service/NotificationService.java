package com.example.grievance.service;

import com.example.grievance.entity.Complaint;
import com.example.grievance.entity.Notification;
import com.example.grievance.entity.User;
import com.example.grievance.entity.enums.ComplaintStatus;
import com.example.grievance.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void notifyComplaintSubmitted(Complaint complaint) {
        createNotification(
                complaint.getCitizen(),
                complaint,
                "Complaint Submitted",
                "Your complaint " + complaint.getComplaintNumber() + " has been submitted successfully."
        );
    }

    public void notifyComplaintAssignment(Complaint complaint) {
        // Notify citizen
        createNotification(
                complaint.getCitizen(),
                complaint,
                "Complaint Assigned",
                "Complaint " + complaint.getComplaintNumber() + " has been assigned to an officer."
        );

        // Notify assigned officer
        if (complaint.getAssignedOfficer() != null) {
            createNotification(
                    complaint.getAssignedOfficer(),
                    complaint,
                    "New Complaint Assigned",
                    "Complaint " + complaint.getComplaintNumber() + " has been assigned to you."
            );
        }
    }

    public void notifyStatusChange(Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus) {
        createNotification(
                complaint.getCitizen(),
                complaint,
                "Complaint Status Updated",
                "Complaint " + complaint.getComplaintNumber()
                        + " status changed from " + oldStatus + " to " + newStatus + "."
        );
    }

    public void notifyComplaintResolved(Complaint complaint) {
        createNotification(
                complaint.getCitizen(),
                complaint,
                "Complaint Resolved",
                "Complaint " + complaint.getComplaintNumber() + " has been resolved."
        );
    }

    public void notifyComplaintClosed(Complaint complaint) {
        createNotification(
                complaint.getCitizen(),
                complaint,
                "Complaint Closed",
                "Complaint " + complaint.getComplaintNumber() + " has been closed."
        );

        // Notify officer if assigned
        if (complaint.getAssignedOfficer() != null) {
            createNotification(
                    complaint.getAssignedOfficer(),
                    complaint,
                    "Complaint Closed by Citizen",
                    "Complaint " + complaint.getComplaintNumber() + " has been closed by the citizen."
            );
        }
    }

    private void createNotification(User user, Complaint complaint, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setComplaint(complaint);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", user.getEmail(), title);
    }
}
