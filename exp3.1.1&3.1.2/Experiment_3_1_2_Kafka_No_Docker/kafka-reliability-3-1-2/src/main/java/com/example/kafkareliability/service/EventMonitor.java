package com.example.kafkareliability.service;
import com.example.kafkareliability.model.EventMessage;
import org.springframework.stereotype.Service;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
@Service public class EventMonitor {
 private final Set<String> done=ConcurrentHashMap.newKeySet(); private final Map<String,AtomicInteger> tries=new ConcurrentHashMap<>(); private final List<Map<String,Object>> logs=Collections.synchronizedList(new ArrayList<>());
 private final AtomicInteger total=new AtomicInteger(),success=new AtomicInteger(),failed=new AtomicInteger(),retry=new AtomicInteger(),dlq=new AtomicInteger(),dup=new AtomicInteger(),processing=new AtomicInteger();
 public void published(EventMessage e){total.incrementAndGet();tries.putIfAbsent(e.getEventId(),new AtomicInteger());log(e,"RECEIVED",0,"Event received from Kafka");}
 public boolean isDone(String id){return done.contains(id);}
 public int start(EventMessage e){int n=tries.computeIfAbsent(e.getEventId(),k->new AtomicInteger()).incrementAndGet();processing.incrementAndGet();log(e,"PROCESSING",n,"Attempt "+n+" started");return n;}
 public void retry(EventMessage e,int n,long d){retry.incrementAndGet();failed.incrementAndGet();processing.decrementAndGet();log(e,"RETRY",n,"Failed - exponential backoff "+d+" ms");}
 public void success(EventMessage e,int n){done.add(e.getEventId());success.incrementAndGet();processing.decrementAndGet();log(e,"SUCCESS",n,"Processed successfully on attempt "+n);}
 public void toDlq(EventMessage e,int n){dlq.incrementAndGet();failed.incrementAndGet();processing.decrementAndGet();log(e,"DLQ",n,"Max retries reached - sent to scheduled-posts.DLQ");}
 public void duplicate(EventMessage e){dup.incrementAndGet();log(e,"DUPLICATE",tries(e.getEventId()),"Idempotency blocked duplicate processing");}
 public int tries(String id){AtomicInteger n=tries.get(id);return n==null?0:n.get();}
 private void log(EventMessage e,String status,int attempt,String msg){Map<String,Object> m=new LinkedHashMap<>();m.put("eventId",e.getEventId());m.put("postId",e.getPostId());m.put("platform",e.getPlatform());m.put("status",status);m.put("attempt",attempt);m.put("message",msg);m.put("time",LocalTime.now().withNano(0).toString());synchronized(logs){logs.add(0,m);if(logs.size()>150)logs.remove(logs.size()-1);}}
 public Map<String,Object> stats(){return Map.of("total",total.get(),"successful",success.get(),"failed",failed.get(),"retried",retry.get(),"dlq",dlq.get(),"duplicates",dup.get(),"processing",Math.max(0,processing.get()));}
 public List<Map<String,Object>> logs(){synchronized(logs){return new ArrayList<>(logs);}}
 public void reset(){done.clear();tries.clear();logs.clear();total.set(0);success.set(0);failed.set(0);retry.set(0);dlq.set(0);dup.set(0);processing.set(0);}
}