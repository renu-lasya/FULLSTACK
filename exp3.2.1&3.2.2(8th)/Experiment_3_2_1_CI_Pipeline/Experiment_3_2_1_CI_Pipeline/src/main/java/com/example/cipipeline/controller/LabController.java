package com.example.cipipeline.controller;
import com.example.cipipeline.model.LabItem;
import com.example.cipipeline.service.LabService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestController
@RequestMapping("/api")
public class LabController {
 private final LabService service;
 public LabController(LabService service){this.service=service;}
 @GetMapping("/health") public Map<String,String> health(){return Map.of("status","UP","message",service.getHealth());}
 @GetMapping("/items") public List<LabItem> items(){return service.getItems();}
 @PostMapping("/items") public LabItem addItem(@RequestBody Map<String,String> body){
  try{return service.addItem(body.get("name"));}
  catch(IllegalArgumentException ex){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,ex.getMessage());}
 }
 @GetMapping("/ci/summary") public Map<String,Object> summary(){
  Map<String,Object> r=new LinkedHashMap<>(); r.put("pipeline","CI Pipeline Demo"); r.put("status","READY");
  r.put("stages",List.of("Build","Unit Tests","API Tests","Contract Check"));
  r.put("note","Run mvn test for actual automated tests."); return r;
 }
}
