import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  ...(process.env.SITE_URL ? { site: process.env.SITE_URL } : {}),
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  integrations: [mdx({ processor: unified() })],
});
