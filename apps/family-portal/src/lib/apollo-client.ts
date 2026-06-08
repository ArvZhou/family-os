'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client';
import { useAuthStore } from '@/stores/auth.store';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation RefreshToken($input: RefreshTokenInput!) {
          refreshToken(input: $input) { accessToken refreshToken }
        }`,
          variables: { input: { refreshToken } },
        }),
      },
    );
    const data = await res.json();
    const payload = data.data?.refreshToken;
    if (payload) {
      useAuthStore.getState().setAccessToken(payload.accessToken);
      useAuthStore.getState().setRefreshToken(payload.refreshToken);
      document.cookie = `refreshToken=${payload.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      return payload.accessToken;
    }
    return null;
  } catch {
    return null;
  }
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return;

  for (const err of graphQLErrors) {
    if (err.extensions?.code === 'UNAUTHENTICATED') {
      return new Observable((observer) => {
        refreshAccessToken().then((newToken) => {
          if (newToken) {
            operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
              headers: { ...headers, authorization: `Bearer ${newToken}` },
            }));
            forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          } else {
            useAuthStore.getState().logout();
            window.location.href = '/login';
            observer.complete();
          }
        });
      });
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
