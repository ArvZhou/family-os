'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { LOGIN } from '@/graphql/operations';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
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
      if (code === 'UNAUTHORIZED') setError('用户名或密码错误');
      else if (code === 'ACCOUNT_NOT_VERIFIED') setError('账号未验证，请先验证邮箱或手机号');
      else setError('登录失败，请稍后重试');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    loginMutation({ variables: { input: { username, password } } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo area */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#1d1d1f] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            Family OS
          </h1>
          <p className="mt-2 text-[17px] text-[#86868b]">登录你的家庭账户</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            autoComplete="username"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            autoComplete="current-password"
          />
          {error && <p className="text-center text-[13px] text-[#ff3b30]">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  );
}
