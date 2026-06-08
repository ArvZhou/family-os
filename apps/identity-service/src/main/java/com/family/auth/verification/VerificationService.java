package com.family.auth.verification;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class VerificationService {

    private final CodeStore codeStore;
    private final VerificationCodeService codeService;

    public VerificationService(CodeStore codeStore, VerificationCodeService codeService) {
        this.codeStore = codeStore;
        this.codeService = codeService;
    }

    public void sendCode(String target) {
        if (!codeStore.canResend(target)) {
            long cooldown = codeStore.resendCooldownSeconds(target);
            throw new VerificationCodeCooldownException(cooldown);
        }

        String code = generateCode();
        codeStore.put(target, code);
        codeService.send(target, code);
    }

    public boolean verifyCode(String target, String code) {
        return codeStore.verify(target, code);
    }

    private String generateCode() {
        int code = new SecureRandom().nextInt(900000) + 100000; // 100000–999999
        return String.valueOf(code);
    }
}
