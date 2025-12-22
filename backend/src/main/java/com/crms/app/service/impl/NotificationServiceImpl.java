package com.crms.app.service.impl;

import com.crms.app.config.NotificationProperties;
import com.crms.app.dto.NotificationPayload;
import com.crms.app.model.Car;
import com.crms.app.model.Location;
import com.crms.app.model.Reservation;
import com.crms.app.service.NotificationService;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private final JavaMailSender mailSender;
    private final NotificationProperties properties;

    public NotificationServiceImpl(JavaMailSender mailSender, NotificationProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    public void sendReservationNotification(Reservation reservation, String eventType) {
        NotificationPayload payload = new NotificationPayload();
        payload.setRecipientEmail(reservation.getMember().getEmail());
        payload.setEventType(eventType);
        payload.setReservationNumber(reservation.getReservationNumber());
        payload.setCarSummary(describeCar(reservation.getCar()));
        payload.setPickupLocation(describeLocation(reservation.getPickupLocation()));
        payload.setDropoffLocation(describeLocation(reservation.getDropoffLocation()));
        payload.setStartDate(reservation.getStartDate());
        payload.setEndDate(reservation.getEndDate());
        payload.setTotalCost(reservation.getTotalCost());

        if (!properties.isEnabled()) {
            logNotification(payload, "disabled");
            return;
        }
        if (!StringUtils.hasText(properties.getFrom())) {
            logNotification(payload, "missing-from");
            return;
        }
        if (!StringUtils.hasText(payload.getRecipientEmail())) {
            logNotification(payload, "missing-recipient");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(payload.getRecipientEmail());
        message.setFrom(properties.getFrom());
        message.setSubject(buildSubject(payload));
        message.setText(buildBody(payload));
        mailSender.send(message);
    }

    private void logNotification(NotificationPayload payload, String reason) {
        logger.info("Reservation notification skipped: reason={}, event={}, email={}, reservation={}",
                reason,
                payload.getEventType(),
                payload.getRecipientEmail(),
                payload.getReservationNumber());
    }

    private String buildSubject(NotificationPayload payload) {
        return String.format("%s %s", properties.getSubjectPrefix(), payload.getEventType());
    }

    private String buildBody(NotificationPayload payload) {
        List<String> lines = new ArrayList<>();
        lines.add(String.format("Reservation event: %s", payload.getEventType()));
        lines.add(String.format("Reservation number: %s", payload.getReservationNumber()));
        lines.add(String.format("Car: %s", payload.getCarSummary()));
        lines.add(String.format("Pickup location: %s", payload.getPickupLocation()));
        lines.add(String.format("Dropoff location: %s", payload.getDropoffLocation()));
        if (payload.getStartDate() != null && payload.getEndDate() != null) {
            lines.add(String.format("Dates: %s to %s", payload.getStartDate(), payload.getEndDate()));
        }
        lines.add(String.format("Total cost: %s", payload.getTotalCost()));
        return String.join(System.lineSeparator(), lines);
    }

    private String describeCar(Car car) {
        if (car == null) {
            return "";
        }
        String licensePlate = car.getLicensePlate() == null ? "" : car.getLicensePlate();
        return String.format("%s %s (%s)", car.getMake(), car.getModel(), licensePlate).trim();
    }

    private String describeLocation(Location location) {
        if (location == null) {
            return "";
        }
        String code = location.getCode() == null ? "" : location.getCode();
        return String.format("%s (%s)", location.getName(), code).trim();
    }
}
