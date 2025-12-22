package com.crms.app.service;

import com.crms.app.model.Reservation;

public interface NotificationService {

    void sendReservationNotification(Reservation reservation, String eventType);
}
