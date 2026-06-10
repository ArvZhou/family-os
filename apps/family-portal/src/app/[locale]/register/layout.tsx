import { ApolloWrapper } from '@/components/apollo-wrapper';

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <ApolloWrapper>{children}</ApolloWrapper>;
}
