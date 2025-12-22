package com.crms.app.service.impl;

import com.crms.app.dto.ReservationSummary;
import com.crms.app.mapper.ReservationMapper;
import com.crms.app.model.Reservation;
import com.crms.app.model.ReservationStatus;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.service.ReportingService;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportingServiceImpl implements ReportingService {

    private static final float PAGE_MARGIN = 50f;
    private static final float START_Y = 750f;
    private static final float LINE_HEIGHT = 14f;

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;

    public ReportingServiceImpl(ReservationRepository reservationRepository,
                                ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
    }

    @Override
    public List<ReservationSummary> listReservations(ReservationStatus status) {
        List<Reservation> reservations = status == null
                ? reservationRepository.findAllByOrderByStartDateDesc()
                : reservationRepository.findAllByStatusOrderByStartDateDesc(status);
        return reservations.stream()
                .map(reservationMapper::toSummary)
                .toList();
    }

    @Override
    public byte[] exportReservationsCsv(ReservationStatus status) {
        List<ReservationSummary> reservations = listReservations(status);
        StringBuilder builder = new StringBuilder();
        builder.append("reservationNumber,status,startDate,endDate,totalCost,memberId,carId,pickupLocationId,dropoffLocationId");
        for (ReservationSummary summary : reservations) {
            builder.append('\n')
                    .append(escapeCsv(summary.getReservationNumber())).append(',')
                    .append(escapeCsv(summary.getStatus())).append(',')
                    .append(escapeCsv(summary.getStartDate())).append(',')
                    .append(escapeCsv(summary.getEndDate())).append(',')
                    .append(escapeCsv(summary.getTotalCost())).append(',')
                    .append(escapeCsv(summary.getMemberId())).append(',')
                    .append(escapeCsv(summary.getCarId())).append(',')
                    .append(escapeCsv(summary.getPickupLocationId())).append(',')
                    .append(escapeCsv(summary.getDropoffLocationId()));
        }
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportReservationsPdf(ReservationStatus status) {
        List<ReservationSummary> reservations = listReservations(status);
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(document);
            String title = status == null
                    ? "Reservation Report (All)"
                    : "Reservation Report (" + status + ")";
            writer.writeLine(title, PDType1Font.HELVETICA_BOLD, 12);
            writer.writeLine("reservationNumber | status | startDate | endDate | totalCost | memberId | carId | pickupLocationId | dropoffLocationId",
                    PDType1Font.HELVETICA, 10);
            for (ReservationSummary summary : reservations) {
                writer.writeLine(formatReservationLine(summary), PDType1Font.HELVETICA, 10);
            }
            writer.close();
            document.save(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to generate reservation PDF report.", ex);
        }
    }

    private String formatReservationLine(ReservationSummary summary) {
        return String.join(" | ",
                safeText(summary.getReservationNumber()),
                safeText(summary.getStatus()),
                safeText(summary.getStartDate()),
                safeText(summary.getEndDate()),
                safeText(summary.getTotalCost()),
                safeText(summary.getMemberId()),
                safeText(summary.getCarId()),
                safeText(summary.getPickupLocationId()),
                safeText(summary.getDropoffLocationId()));
    }

    private String escapeCsv(Object value) {
        String text = safeText(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")) {
            text = text.replace("\"", "\"\"");
            return "\"" + text + "\"";
        }
        return text;
    }

    private String safeText(Object value) {
        return value == null ? "" : value.toString();
    }

    private static class PdfWriter implements Closeable {

        private final PDDocument document;
        private PDPage page;
        private PDPageContentStream contentStream;
        private float y;

        private PdfWriter(PDDocument document) throws IOException {
            this.document = document;
            startPage();
        }

        private void writeLine(String text, PDType1Font font, int fontSize) throws IOException {
            if (y <= PAGE_MARGIN) {
                startPage();
            }
            contentStream.beginText();
            contentStream.setFont(font, fontSize);
            contentStream.newLineAtOffset(PAGE_MARGIN, y);
            contentStream.showText(text);
            contentStream.endText();
            y -= LINE_HEIGHT;
        }

        private void startPage() throws IOException {
            closeContentStream();
            page = new PDPage();
            document.addPage(page);
            contentStream = new PDPageContentStream(document, page);
            y = START_Y;
        }

        private void closeContentStream() throws IOException {
            if (contentStream != null) {
                contentStream.close();
            }
        }

        @Override
        public void close() throws IOException {
            closeContentStream();
        }
    }
}
