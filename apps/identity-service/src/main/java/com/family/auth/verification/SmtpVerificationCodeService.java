package com.family.auth.verification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends verification codes via SMTP email.
 * Activated when sms.provider=smtp.
 */
@Service
@ConditionalOnProperty(name = "sms.provider", havingValue = "smtp")
public class SmtpVerificationCodeService implements VerificationCodeService {

    private static final Logger log = LoggerFactory.getLogger(SmtpVerificationCodeService.class);

    private final JavaMailSender mailSender;
    private final String mailFrom;

    public SmtpVerificationCodeService(JavaMailSender mailSender,
                                       @Value("${spring.mail.username}") String mailFrom) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    @Override
    public void send(String target, String code) {
        if (!supports(target)) {
            log.warn("SMTP service does not support target: {}", target);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(target);
            helper.setSubject("FamilyOS — 账号验证码");

            String htmlContent = buildEmailHtml(code);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Verification code sent to {} successfully", target);
        } catch (MessagingException e) {
            log.error("Failed to send verification code to {}", target, e);
        }
    }

    @Override
    public boolean supports(String target) {
        return target != null && target.contains("@");
    }

    private String buildEmailHtml(String code) {
        return """
                <div style="max-width:480px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
                  <div style="text-align:center;margin-bottom:32px">
                    <h1 style="font-size:24px;font-weight:600;color:#1d1d1f;margin:0">FamilyOS</h1>
                    <p style="font-size:15px;color:#86868b;margin:8px 0 0">家庭数字管理平台</p>
                  </div>
                  <div style="background:#f5f5f7;border-radius:16px;padding:32px 24px;text-align:center">
                    <p style="font-size:15px;color:#1d1d1f;margin:0 0 24px">你的验证码是</p>
                    <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0071e3;margin-bottom:24px">%s</div>
                    <p style="font-size:13px;color:#86868b;margin:0">验证码 5 分钟内有效，请勿泄露给他人</p>
                  </div>
                  <p style="text-align:center;font-size:12px;color:#86868b;margin-top:24px">
                    此邮件由 FamilyOS 自动发送，请勿回复
                  </p>
                </div>
                """.formatted(code);
    }
}
