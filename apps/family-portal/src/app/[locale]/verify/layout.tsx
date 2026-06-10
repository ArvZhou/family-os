import { ApolloWrapper } from '@/components/apollo-wrapper';

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <ApolloWrapper>{children}</ApolloWrapper>;
}
