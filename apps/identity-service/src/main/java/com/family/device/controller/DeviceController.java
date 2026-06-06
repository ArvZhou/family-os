package com.family.device.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Devices", description = "IoT device registry")
@RestController
@RequestMapping("/api/v1/devices")
public class DeviceController {
}
