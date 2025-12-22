package com.crms.app.service.impl;

import com.crms.app.dto.NotificationPayload;
import com.crms.app.model.Car;
import com.crms.app.model.Location;
import com.crms.app.model.Reservation;
import com.crms.app.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    public void sendReservationNotification(Reservation reservation, String eventType) {
        NotificationPayload payload = new NotificationPayload();
        payload.setRecipientEmail(reservation.getMember().getEmail());
        payload.setEventType(eventType);
        payload.setReservationNumber(reservation.getReservationNumber());
        payload.setCarSummary(describeCar(reservation.getCar()));
        payload.setPickupLocation(describeLocation(reservation.getPickupLocation()));
        payload.setDropoffLocation(describeLocation(reservation.getDropoffLocation()));
        payload.setTotalCost(reservation.getTotalCost());

        logger.info("Reservation notification: event={}, email={}, reservation={}, car={}, pickup={}, dropoff={}, total={}",
                payload.getEventType(),
                payload.getRecipientEmail(),
                payload.getReservationNumber(),
                payload.getCarSummary(),
                payload.getPickupLocation(),
                payload.getDropoffLocation(),
                payload.getTotalCost());
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
