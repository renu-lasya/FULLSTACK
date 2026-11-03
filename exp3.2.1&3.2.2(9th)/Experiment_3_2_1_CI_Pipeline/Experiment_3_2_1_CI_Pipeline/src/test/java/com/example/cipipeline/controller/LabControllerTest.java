package com.example.cipipeline.controller;
import com.example.cipipeline.service.LabService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(LabController.class)
class LabControllerTest {
 @Autowired MockMvc mockMvc;
 @MockitoBean LabService service;
 @Test void healthEndpointShouldReturnUpStatus() throws Exception {
  given(service.getHealth()).willReturn("CI Lab API is running");
  mockMvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP")).andExpect(jsonPath("$.message").value("CI Lab API is running"));
 }
 @Test void summaryShouldContainPipelineStages() throws Exception {
  mockMvc.perform(get("/api/ci/summary")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("READY")).andExpect(jsonPath("$.stages.length()").value(4));
 }
}
