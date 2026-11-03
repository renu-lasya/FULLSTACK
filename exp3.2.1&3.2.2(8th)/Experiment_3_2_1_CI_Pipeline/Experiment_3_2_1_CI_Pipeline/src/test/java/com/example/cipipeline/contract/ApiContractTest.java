package com.example.cipipeline.contract;
import com.example.cipipeline.controller.LabController;
import com.example.cipipeline.service.LabService;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
/** Lightweight response contract assertion; Pact JUnit 5 dependency is included for extension. */
class ApiContractTest {
 @Test void healthContractMustContainStatusAndMessage(){
  LabController controller=new LabController(new LabService()); Map<String,String> response=controller.health();
  assertEquals("UP",response.get("status")); assertNotNull(response.get("message")); assertFalse(response.get("message").isBlank());
 }
}
