import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'as-needed',
});

export const { Link, useRouter, usePathname, redirect, permanentRedirect, getPathname } =
  createNavigation(routing);
