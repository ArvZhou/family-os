import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_GRAPHQL_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_MQTT_BROKER: z.string().url().optional(),
  NEXT_PUBLIC_SSO_ENABLED: z.enum(['true', 'false']).optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_MQTT_BROKER: process.env.NEXT_PUBLIC_MQTT_BROKER,
  NEXT_PUBLIC_SSO_ENABLED: process.env.NEXT_PUBLIC_SSO_ENABLED,
});
