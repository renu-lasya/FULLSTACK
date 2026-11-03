package com.example.cipipeline.service;
import com.example.cipipeline.model.LabItem;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class LabServiceTest {
 private final LabService service=new LabService();
 @Test void healthMessageShouldBeAvailable(){assertEquals("CI Lab API is running",service.getHealth());}
 @Test void shouldCreateItem(){LabItem item=service.addItem("JUnit Lab");assertEquals("JUnit Lab",item.getName());assertEquals("CREATED",item.getStatus());assertTrue(item.getId()>0);}
 @Test void shouldRejectBlankItemName(){assertThrows(IllegalArgumentException.class,()->service.addItem(" "));}
}
