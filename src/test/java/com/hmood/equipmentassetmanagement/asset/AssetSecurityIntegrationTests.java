package com.hmood.equipmentassetmanagement.asset;

import com.hmood.equipmentassetmanagement.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class AssetSecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAssetsWithoutTokenReturnsUnauthorized() throws Exception {

        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createAssetAsAdminReturnsForbidden() throws Exception {

        mockMvc.perform(post("/api/assets")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_ADMIN")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Security Test Laptop",
                                  "category": "Laptop",
                                  "serialNumber": "SECURITY-TEST-001",
                                  "purchaseDate": "2026-08-04"
                                }
                                """))
                .andExpect(status().isForbidden());
    }
}