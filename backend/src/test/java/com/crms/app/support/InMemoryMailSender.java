package com.crms.app.support;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;

public class InMemoryMailSender implements JavaMailSender {

    private final List<SimpleMailMessage> sentMessages = new ArrayList<>();

    public List<SimpleMailMessage> getSentMessages() {
        return Collections.unmodifiableList(sentMessages);
    }

    public void clear() {
        sentMessages.clear();
    }

    @Override
    public void send(SimpleMailMessage simpleMessage) throws MailException {
        sentMessages.add(simpleMessage);
    }

    @Override
    public void send(SimpleMailMessage... simpleMessages) throws MailException {
        if (simpleMessages == null) {
            return;
        }
        Collections.addAll(sentMessages, simpleMessages);
    }

    @Override
    public jakarta.mail.internet.MimeMessage createMimeMessage() {
        throw new UnsupportedOperationException("Mime messages not supported in test sender.");
    }

    @Override
    public jakarta.mail.internet.MimeMessage createMimeMessage(java.io.InputStream contentStream) {
        throw new UnsupportedOperationException("Mime messages not supported in test sender.");
    }

    @Override
    public void send(jakarta.mail.internet.MimeMessage mimeMessage) throws MailException {
        throw new UnsupportedOperationException("Mime messages not supported in test sender.");
    }

    @Override
    public void send(jakarta.mail.internet.MimeMessage... mimeMessages) throws MailException {
        throw new UnsupportedOperationException("Mime messages not supported in test sender.");
    }

    @Override
    public void send(MimeMessagePreparator mimeMessagePreparator) throws MailException {
        throw new UnsupportedOperationException("Mime messages not supported in test sender.");
    }

    @Override
    public void send(MimeMessagePreparator... mimeMessagePreparators) throws MailException {
        throw new UnsupportedOperationException("Mime messages not supported in test sender.");
    }
}
