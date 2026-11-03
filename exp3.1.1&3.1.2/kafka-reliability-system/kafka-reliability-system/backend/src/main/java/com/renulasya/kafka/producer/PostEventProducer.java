package com.renulasya.kafka.producer;

import com.renulasya.kafka.config.InMemoryKafkaBroker;
import com.renulasya.kafka.model.PostEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
public class PostEventProducer {

    private static final Logger log = LoggerFactory.getLogger(PostEventProducer.class);

    private final InMemoryKafkaBroker broker;

    public PostEventProducer(@Lazy InMemoryKafkaBroker broker) {
        this.broker = broker;
    }

    public void send(PostEvent event) {
        log.info("PRODUCER → scheduled-posts eventId={}", event.getEventId());
        broker.publish(event);
    }

    public void sendToDlq(PostEvent event) {
        log.warn("PRODUCER → scheduled-posts.DLT eventId={}", event.getEventId());
        broker.publishToDlq(event);
    }
}
