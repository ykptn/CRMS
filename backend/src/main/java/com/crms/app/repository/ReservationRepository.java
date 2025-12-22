package com.crms.app.repository;

import com.crms.app.model.Reservation;
import com.crms.app.model.ReservationStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
            select count(r) > 0
            from Reservation r
            where r.car.id = :carId
              and r.status = :status
              and r.startDate <= :endDate
              and r.endDate >= :startDate
            """)
    boolean existsOverlappingReservation(
            @Param("carId") Long carId,
            @Param("status") ReservationStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            select count(r) > 0
            from Reservation r
            where r.car.id = :carId
              and r.status = :status
              and r.id <> :reservationId
              and r.startDate <= :endDate
              and r.endDate >= :startDate
            """)
    boolean existsOverlappingReservationExcludingId(
            @Param("carId") Long carId,
            @Param("reservationId") Long reservationId,
            @Param("status") ReservationStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Reservation> findAllByStatusOrderByStartDateDesc(ReservationStatus status);

    List<Reservation> findAllByOrderByStartDateDesc();
}
