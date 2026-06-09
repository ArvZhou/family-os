'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LOGIN } from '@/graphql/operations';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const payload = data.login;
      useAuthStore.getState().login(payload.accessToken, payload.user);
      useAuthStore.getState().setRefreshToken(payload.refreshToken);
      document.cookie = `refreshToken=${payload.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      router.push('/members');
    },
    onError: (err) => {
      const code = (err.graphQLErrors?.[0]?.extensions as any)?.code;
      if (code === 'UNAUTHORIZED') setError(t('wrongPassword'));
      else if (code === 'ACCOUNT_NOT_VERIFIED') setError(t('notVerified'));
      else setError(t('loginFailed'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError(t('enterCredentials'));
      return;
    }
    loginMutation({ variables: { input: { username, password } } });
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
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
                autoComplete="current-password"
                className="flex h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white"
              />
            </div>
            {error && <p className="text-center text-[13px] text-[#ff3b30]">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('loggingIn') : t('login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
