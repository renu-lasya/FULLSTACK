package com.example.kafkareliability.service;
import com.example.kafkareliability.model.*;import com.fasterxml.jackson.databind.ObjectMapper;import org.springframework.beans.factory.annotation.Value;import org.springframework.kafka.core.KafkaTemplate;import org.springframework.stereotype.Service;
@Service public class KafkaProducerService {
 private final KafkaTemplate<String,String> kafka;private final ObjectMapper mapper;private final EventMonitor monitor;private EventMessage last;
 @Value("${app.kafka.main-topic}") private String topic;
 public KafkaProducerService(KafkaTemplate<String,String> k,ObjectMapper m,EventMonitor em){kafka=k;mapper=m;monitor=em;}
 public synchronized EventMessage publish(EventRequest r)throws Exception{String id=blank(r.getEventId(),"EVT-"+System.currentTimeMillis());EventMessage e=new EventMessage(id,blank(r.getPostId(),"POST-1001"),blank(r.getUserName(),"student"),blank(r.getPlatform(),"Instagram"),blank(r.getContent(),"Scheduled post"),blank(r.getScheduledTime(),"10:30 AM"),blank(r.getFailureMode(),"SUCCESS"));kafka.send(topic,e.getEventId(),mapper.writeValueAsString(e));monitor.published(e);last=e;return e;}
 public synchronized void duplicate()throws Exception{if(last==null)throw new IllegalStateException("Publish an event first.");kafka.send(topic,last.getEventId(),mapper.writeValueAsString(last));}
 public EventMessage getLast(){return last;} private String blank(String s,String f){return s==null||s.isBlank()?f:s;}
}