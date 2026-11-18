import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const research = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/research' }),
  schema: z.object({
    title: z.string(), description: z.string(), date: z.coerce.date(),
    category: z.string(), author: z.string(), image: z.string(),
    imageAlt: z.string(), caption: z.string(),
    sample: z.boolean().default(true), minutes: z.number(),
  }),
});
export const collections = { research };
