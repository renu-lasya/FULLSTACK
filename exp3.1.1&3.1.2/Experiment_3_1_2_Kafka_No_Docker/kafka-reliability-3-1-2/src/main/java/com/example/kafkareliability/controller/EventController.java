package com.example.kafkareliability.controller;
import com.example.kafkareliability.model.EventRequest;import com.example.kafkareliability.service.*;import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api") @CrossOrigin public class EventController {
 private final KafkaProducerService producer;private final EventMonitor monitor;
 public EventController(KafkaProducerService p,EventMonitor m){producer=p;monitor=m;}
 @PostMapping("/publish") public Map<String,Object> publish(@RequestBody EventRequest r)throws Exception{var e=producer.publish(r);return Map.of("message","Published to Kafka","eventId",e.getEventId(),"topic","scheduled-posts","status","PUBLISHED");}
 @PostMapping("/duplicate") public ResponseEntity<?> duplicate()throws Exception{if(producer.getLast()==null)return ResponseEntity.badRequest().body(Map.of("message","Publish an event first."));producer.duplicate();return ResponseEntity.ok(Map.of("message","Duplicate sent with same Event ID","eventId",producer.getLast().getEventId()));}
 @GetMapping("/stats") public Map<String,Object> stats(){return monitor.stats();}
 @GetMapping("/logs") public List<Map<String,Object>> logs(){return monitor.logs();}
 @PostMapping("/reset") public Map<String,String> reset(){monitor.reset();return Map.of("message","Reset complete");}
 @GetMapping("/health") public Map<String,String> health(){return Map.of("api","Online","kafka","Embedded Kafka Online");}
}