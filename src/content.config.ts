import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { blogSchema } from './schemas/blog.ts';
import { changelogSchema } from './schemas/changelog.ts';
import { projectsSchema } from './schemas/projects.ts';
import { talksSchema } from './schemas/talks.ts';

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: blogSchema
});

const changelogCollection = defineCollection({
	loader: glob({
		pattern: '**/*.md',
		base: './src/content/changelog',
		generateId: (({ entry }) => entry.replace('.md', ''))
	}),
	schema: changelogSchema
});

const projectsCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: projectsSchema
});

const talksCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
	schema: talksSchema
});

export const collections = {
	blog: blogCollection,
	changelog: changelogCollection,
	projects: projectsCollection,
	talks: talksCollection
};
