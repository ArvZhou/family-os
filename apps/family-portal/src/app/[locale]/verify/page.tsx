'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { VERIFY, RESEND_CODE } from '@/graphql/operations';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function VerifyPage() {
  const t = useTranslations('verify');
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = searchParams.get('target') || '';
  const user = useAuthStore((s) => s.user);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Use the user's email/phone as fallback target
  const displayTarget = target || user?.email || '';

  const [verifyMutation, { loading: verifying }] = useMutation(VERIFY, {
    onCompleted: (data) => {
      if (data.verify.success) {
        setSuccessMsg(data.verify.message);
        setError('');
        setTimeout(() => router.push('/members'), 1500);
      } else {
        setError(data.verify.message);
      }
    },
    onError: () => {
      setError(t('verifyFailed'));
    },
  });

  const [resendMutation, { loading: resending }] = useMutation(RESEND_CODE, {
    onCompleted: (data) => {
      if (data.resendCode.success) {
        setSuccessMsg(data.resendCode.message);
        setError('');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.resendCode.message);
      }
    },
    onError: () => {
      setError(t('resendFailed'));
    },
  });

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newCode.every((c) => c !== '')) {
      const fullCode = newCode.join('');
      verifyMutation({ variables: { input: { target: displayTarget, code: fullCode } } });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || '';
    }
    setCode(newCode);
    if (pasted.length === 6) {
      verifyMutation({ variables: { input: { target: displayTarget, code: pasted } } });
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError(t('enterFullCode'));
      return;
    }
    setError('');
    verifyMutation({ variables: { input: { target: displayTarget, code: fullCode } } });
  };

  const handleResend = () => {
    setError('');
    setSuccessMsg('');
    resendMutation({ variables: { input: { target: displayTarget } } });
  };

  // If no target, redirect to register
  useEffect(() => {
    if (!displayTarget) {
      router.push('/register');
    }
  }, [displayTarget, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-[380px] animate-fade-in-up">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#0071e3] shadow-[0_4px_16px_rgba(0,113,227,0.25)]">
            <ShieldCheck size={24} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            {t('title')}
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            {t('description')}{' '}
            {displayTarget && <span className="font-medium text-[#1d1d1f]">{displayTarget}</span>}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
          {/* Code Input */}
          <div className="mb-6 flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={verifying || !!successMsg}
                className="h-14 w-12 rounded-xl bg-[#f5f5f7] text-center text-[22px] font-semibold text-[#1d1d1f] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white disabled:opacity-50"
              />
            ))}
          </div>

          {error && <p className="mb-4 text-center text-[13px] text-[#ff3b30]">{error}</p>}
          {successMsg && (
            <p className="mb-4 text-center text-[13px] text-[#30b158]">{successMsg}</p>
          )}

          <Button
            type="button"
            onClick={handleVerify}
            className="w-full"
            size="lg"
            disabled={verifying || resending || !!successMsg || code.join('').length !== 6}
          >
            {verifying ? t('verifying') : t('verify')}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || verifying || !!successMsg}
            className="mt-4 w-full text-center text-[14px] text-[#0071e3] hover:underline disabled:text-[#86868b] disabled:no-underline cursor-pointer"
          >
            {resending ? t('resending') : t('resend')}
          </button>
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-[14px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          <ArrowLeft size={14} />
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}
