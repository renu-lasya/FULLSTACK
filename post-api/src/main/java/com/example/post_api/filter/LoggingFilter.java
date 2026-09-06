package com.example.post_api.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Component;
import org.slf4j.MDC;

import java.io.IOException;
import java.util.UUID;

@Component
public class LoggingFilter implements jakarta.servlet.Filter {

    private static final Logger logger =
            LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public void doFilter(
            jakarta.servlet.ServletRequest request,
            jakarta.servlet.ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest =
                (HttpServletRequest) request;

        HttpServletResponse httpResponse =
                (HttpServletResponse) response;

        String correlationId = UUID.randomUUID().toString();

        MDC.put("correlationId", correlationId);

        long startTime = System.currentTimeMillis();

        logger.info(
                "Request started: {} {}",
                httpRequest.getMethod(),
                httpRequest.getRequestURI()
        );

        httpResponse.setHeader(
                "X-Correlation-ID",
                correlationId
        );

        try {

            chain.doFilter(request, response);

        } finally {

            long executionTime =
                    System.currentTimeMillis() - startTime;

            logger.info(
                    "Request completed: {} {} | Status: {} | Time: {} ms",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpResponse.getStatus(),
                    executionTime
            );

            MDC.clear();
        }
    }
}