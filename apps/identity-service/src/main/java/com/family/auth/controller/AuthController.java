package com.family.auth.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Auth & SSO endpoints")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
}
