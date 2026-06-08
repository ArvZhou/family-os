import { ApolloWrapper } from '@/components/apollo-wrapper';
import { AuthProvider } from '@/components/auth-provider';
import { AppShell } from '@/components/app-shell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApolloWrapper>
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </ApolloWrapper>
  );
}
