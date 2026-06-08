package com.family.auth.verification;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory verification code store with TTL.
 * Codes expire after 5 minutes. One code per target.
 */
@Component
public class CodeStore {

    private static final long CODE_TTL_SECONDS = 300; // 5 minutes
    private static final long RESEND_COOLDOWN_SECONDS = 60; // 1 minute

    private final Map<String, CodeEntry> store = new ConcurrentHashMap<>();

    public void put(String target, String code) {
        store.put(target, new CodeEntry(code, Instant.now()));
    }

    public boolean verify(String target, String code) {
        CodeEntry entry = store.get(target);
        if (entry == null) {
            return false;
        }
        if (entry.isExpired()) {
            store.remove(target);
            return false;
        }
        boolean matches = entry.code.equals(code);
        if (matches) {
            store.remove(target); // one-time use
        }
        return matches;
    }

    public boolean canResend(String target) {
        CodeEntry entry = store.get(target);
        if (entry == null) {
            return true;
        }
        return entry.ageSeconds() >= RESEND_COOLDOWN_SECONDS;
    }

    public long resendCooldownSeconds(String target) {
        CodeEntry entry = store.get(target);
        if (entry == null) {
            return 0;
        }
        long remaining = RESEND_COOLDOWN_SECONDS - entry.ageSeconds();
        return Math.max(0, remaining);
    }

    public void remove(String target) {
        store.remove(target);
    }

    private record CodeEntry(String code, Instant createdAt) {
        boolean isExpired() {
            return Instant.now().isAfter(createdAt.plusSeconds(CODE_TTL_SECONDS));
        }

        long ageSeconds() {
            return Instant.now().getEpochSecond() - createdAt.getEpochSecond();
        }
    }
}
