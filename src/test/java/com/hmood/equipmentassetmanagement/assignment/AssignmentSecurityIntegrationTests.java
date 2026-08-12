package com.hmood.equipmentassetmanagement.assignment;

import com.hmood.equipmentassetmanagement.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class AssignmentSecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAssignmentsWithoutTokenReturnsUnauthorized() throws Exception {

        mockMvc.perform(get("/api/assignments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAssignmentsAsEmployeeReturnsForbidden() throws Exception {

        mockMvc.perform(get("/api/assignments")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_EMPLOYEE")
                        )))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAssignmentsAsManagerReturnsOk() throws Exception {

        mockMvc.perform(get("/api/assignments")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_MANAGER")
                        )))
                .andExpect(status().isOk());
    }

    @Test
    void getAssignmentsAsAdminReturnsOk() throws Exception {

        mockMvc.perform(get("/api/assignments")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_ADMIN")
                        )))
                .andExpect(status().isOk());
    }
    @Test
    void createAssignmentAsManagerReturnsForbidden() throws Exception {

        mockMvc.perform(post("/api/assignments")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_MANAGER")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "assetId": 1,
                              "userId": 1
                            }
                            """))
                .andExpect(status().isForbidden());
    }

    @Test
    void returnAssignmentAsManagerReturnsForbidden() throws Exception {

        mockMvc.perform(put("/api/assignments/1/return")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_MANAGER")
                        )))
                .andExpect(status().isForbidden());
    }
}