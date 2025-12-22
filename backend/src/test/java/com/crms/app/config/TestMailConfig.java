package com.crms.app.config;

import com.crms.app.support.InMemoryMailSender;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestMailConfig {

    @Bean
    @Primary
    public InMemoryMailSender inMemoryMailSender() {
        return new InMemoryMailSender();
    }
}
