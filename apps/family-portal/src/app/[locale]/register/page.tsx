'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { REGISTER } from '@/graphql/operations';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

type RegisterMode = 'email' | 'phone';

export default function RegisterPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const [mode, setMode] = useState<RegisterMode>('email');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [registerMutation, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      const payload = data.register;
      useAuthStore.getState().login(payload.accessToken, payload.user);
      useAuthStore.getState().setRefreshToken(payload.refreshToken);
      document.cookie = `refreshToken=${payload.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      // Redirect to verification page — code was sent to the user's email or phone
      const target = payload.user?.email || payload.user?.phone || '';
      router.push(`/verify?target=${encodeURIComponent(target)}`);
    },
    onError: (err) => {
      const code = (err.graphQLErrors?.[0]?.extensions as any)?.code;
      const message = err.graphQLErrors?.[0]?.message;
      if (code === 'USERNAME_EXISTS') setError(t('usernameExists'));
      else if (code === 'VALIDATION_FAILED') {
        setError(message || t('validationFailed'));
      } else if (message) setError(message);
      else setError(t('registerFailed'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !name || !password || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }

    if (mode === 'email' && !email) {
      setError(t('fillAllFields'));
      return;
    }

    if (mode === 'phone' && !phone) {
      setError(t('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    registerMutation({
      variables: {
        input: {
          username,
          name,
          password,
          email: mode === 'email' ? email : undefined,
          phone: mode === 'phone' ? phone : undefined,
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-[380px] animate-fade-in-up">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#1d1d1f] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            {t('title')}
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">{t('subtitle')}</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
          <div className="mb-6 flex rounded-xl bg-[#f5f5f7] p-1">
            <button
              type="button"
              onClick={() => setMode('email')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-[500] transition-all duration-200 cursor-pointer',
                mode === 'email'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]',
              )}
            >
              <Mail size={14} />
              {t('byEmail')}
            </button>
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-[500] transition-all duration-200 cursor-pointer',
                mode === 'phone'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]',
              )}
            >
              <Phone size={14} />
              {t('byPhone')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-[450] text-[#1d1d1f]">
                {t('username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('enterUsername')}
                autoComplete="username"
                className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-[450] text-[#1d1d1f]">
                {t('displayName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('enterDisplayName')}
                autoComplete="name"
                className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
              />
            </div>
            {mode === 'email' ? (
              <div>
                <label className="mb-1.5 block text-[13px] font-[450] text-[#1d1d1f]">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterEmail')}
                  autoComplete="email"
                  className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-[13px] font-[450] text-[#1d1d1f]">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('enterPhone')}
                  autoComplete="tel"
                  className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-[13px] font-[450] text-[#1d1d1f]">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
                autoComplete="new-password"
                className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-[450] text-[#1d1d1f]">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('enterConfirmPassword')}
                autoComplete="new-password"
                className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
              />
            </div>
            {error && <p className="text-center text-[13px] text-[#ff3b30]">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('registering') : t('register')}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[14px] text-[#86868b]">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-[#0071e3] hover:underline">
            {t('goLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
