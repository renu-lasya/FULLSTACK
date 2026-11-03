package com.example.kafkareliability;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.test.context.EmbeddedKafka;
@SpringBootApplication
@EmbeddedKafka(partitions=1, topics={"scheduled-posts","scheduled-posts.DLQ"}, bootstrapServersProperty="spring.kafka.bootstrap-servers")
public class KafkaReliabilityApplication {
 public static void main(String[] args){SpringApplication.run(KafkaReliabilityApplication.class,args);}
}