package com.example.kafkareliability.service;
import com.example.kafkareliability.model.EventMessage;import com.fasterxml.jackson.databind.ObjectMapper;import org.springframework.beans.factory.annotation.Value;import org.springframework.kafka.annotation.KafkaListener;import org.springframework.kafka.core.KafkaTemplate;import org.springframework.stereotype.Service;
@Service public class KafkaConsumerService {
 private final ObjectMapper mapper;private final KafkaTemplate<String,String> kafka;private final EventMonitor monitor;
 @Value("${app.kafka.dlq-topic}") private String dlq;@Value("${app.retry.max-attempts}") private int max;@Value("${app.retry.initial-delay-ms}") private long initial;
 public KafkaConsumerService(ObjectMapper m,KafkaTemplate<String,String> k,EventMonitor em){mapper=m;kafka=k;monitor=em;}
 @KafkaListener(topics="${app.kafka.main-topic}")
 public void consume(String json)throws Exception{EventMessage e=mapper.readValue(json,EventMessage.class);if(monitor.isDone(e.getEventId())){monitor.duplicate(e);return;}int n=monitor.start(e);try{if("FAIL_1".equals(e.getFailureMode())&&n<=1)throw new RuntimeException("Failure");if("FAIL_2".equals(e.getFailureMode())&&n<=2)throw new RuntimeException("Failure");if("ALWAYS_FAIL".equals(e.getFailureMode()))throw new RuntimeException("Permanent failure");monitor.success(e,n);}catch(Exception ex){if(n<max){long delay=initial*(1L<<(n-1));monitor.retry(e,n,delay);Thread.sleep(delay);throw ex;}monitor.toDlq(e,n);kafka.send(dlq,e.getEventId(),json);}}
}