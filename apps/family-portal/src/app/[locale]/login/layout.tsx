import { ApolloWrapper } from '@/components/apollo-wrapper';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <ApolloWrapper>{children}</ApolloWrapper>;
}
