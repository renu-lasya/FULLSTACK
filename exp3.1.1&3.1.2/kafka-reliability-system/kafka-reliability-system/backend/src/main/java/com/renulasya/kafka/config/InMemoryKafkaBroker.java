package com.renulasya.kafka.config;

import com.renulasya.kafka.model.PostEvent;
import com.renulasya.kafka.service.EventProcessingService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.concurrent.*;

/**
 * In-memory simulation of Kafka (no Docker / external broker).
 * Topics: scheduled-posts , scheduled-posts.DLT
 */
@Component
public class InMemoryKafkaBroker {

    private static final Logger log = LoggerFactory.getLogger(InMemoryKafkaBroker.class);

    private final BlockingQueue<PostEvent> mainTopic = new LinkedBlockingQueue<>();
    private final BlockingQueue<PostEvent> dlqTopic = new LinkedBlockingQueue<>();
    private final EventProcessingService processingService;
    private volatile boolean running = true;
    private ExecutorService consumerPool;

    public InMemoryKafkaBroker(@Lazy EventProcessingService processingService) {
        this.processingService = processingService;
    }

    @PostConstruct
    public void startConsumer() {
        consumerPool = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "kafka-consumer-sim");
            t.setDaemon(true);
            return t;
        });
        consumerPool.submit(this::consumeLoop);
        log.info("In-memory Kafka broker started (scheduled-posts + scheduled-posts.DLT)");
    }

    @PreDestroy
    public void stop() {
        running = false;
        if (consumerPool != null) consumerPool.shutdownNow();
    }

    public void publish(PostEvent event) {
        log.info("PRODUCER → topic=scheduled-posts eventId={}", event.getEventId());
        mainTopic.offer(event);
    }

    public void publishToDlq(PostEvent event) {
        log.warn("PRODUCER → DLQ scheduled-posts.DLT eventId={}", event.getEventId());
        dlqTopic.offer(event);
    }

    private void consumeLoop() {
        while (running) {
            try {
                PostEvent event = mainTopic.poll(400, TimeUnit.MILLISECONDS);
                if (event != null) {
                    log.info("CONSUMER received eventId={}", event.getEventId());
                    processingService.process(event);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Consumer error: {}", e.getMessage(), e);
            }
        }
    }
}
