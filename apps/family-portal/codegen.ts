import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  documents: 'src/graphql/**/*.ts',
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withRefetchFn: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, unknown>',
          Upload: 'File',
        },
      },
    },
  },
};

export default config;
