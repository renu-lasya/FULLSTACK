package com.example.cipipeline.service;
import com.example.cipipeline.model.LabItem;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
@Service
public class LabService {
 private final AtomicLong ids = new AtomicLong(2);
 private final List<LabItem> items = new CopyOnWriteArrayList<>(List.of(
  new LabItem(1,"JUnit 5 Unit Test","PASSED"), new LabItem(2,"MockMvc API Test","PASSED")));
 public List<LabItem> getItems(){return List.copyOf(items);}
 public LabItem addItem(String name){
  if(name==null || name.isBlank()) throw new IllegalArgumentException("Item name cannot be empty");
  LabItem item=new LabItem(ids.incrementAndGet(),name.trim(),"CREATED"); items.add(item); return item;
 }
 public String getHealth(){return "CI Lab API is running";}
}
