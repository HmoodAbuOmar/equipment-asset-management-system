package com.hmood.equipmentassetmanagement;

import org.springframework.boot.SpringApplication;

public class TestEquipmentAssetManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.from(EquipmentAssetManagementSystemApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
