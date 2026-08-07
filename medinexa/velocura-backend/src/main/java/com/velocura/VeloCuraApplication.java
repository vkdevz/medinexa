package com.velocura;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VeloCuraApplication {

    public static void main(String[] args) {
        SpringApplication.run(VeloCuraApplication.class, args);
    }
}
