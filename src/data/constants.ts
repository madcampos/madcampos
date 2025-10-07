import { join } from './path.ts';

interface ConstantsMap {
	url: string;
	title: string[];
	titleString: string;
	description: string;
	tags: string[];
}

export const GLOBALS: ConstantsMap = {
	url: '/',
	title: ['Marco Campos'],
	titleString: 'Marco Campos — Senior Web Developer',
	description: 'Marco Campos — Senior Web Developer — Vue.js, Node.js, TypeScript, JavaScript',
	tags: [
		'Senior web developer',
		'web developer',
		'vue.js',
		'vue',
		'node.js',
		'javascript',
		'typescript',
		'webdev'
	]
};

export const BLOG: ConstantsMap = {
	url: '/blog/',
	title: ['Blog', ...GLOBALS.title],
	titleString: "Marco Campos' Blog",
	description: "Marco Campos' Blog — A space where I talk about web development and other programming related (or not) things.",
	tags: ['blog', ...GLOBALS.tags]
};

export const BLOG_TAGS: ConstantsMap = {
	url: join([BLOG.url, 'tags']),
	title: ['Tags', ...BLOG.title],
	titleString: "Tags for Marco Campos' blog",
	description: "Marco Campos' Blog — Tags for my blog posts",
	tags: BLOG.tags
};

export const BLOG_AUTHOR: ConstantsMap = {
	url: join([BLOG.url, 'authors']),
	title: ['Authors', ...BLOG.title],
	titleString: "Authors for Marco Campos' blog",
	description: "Marco Campos' Blog — Authors for the blog",
	tags: BLOG.tags
};

export const PROJECTS: ConstantsMap = {
	url: '/projects/',
	title: ['Projects', ...GLOBALS.title],
	titleString: 'Project Highlight',
	description: "Marco Campos' Projects — A list of projects I've worked on, or am currently working on. Mostly web development",
	tags: ['projects', ...GLOBALS.tags]
};

export const TALKS: ConstantsMap = {
	url: '/talks/',
	title: ['Talks', ...GLOBALS.title],
	titleString: 'Talks, Presentations & Workshops',
	description: "Marco Campos' Talks — A list of talks I've given on meetups, conferences, or other events.",
	tags: ['talks', ...GLOBALS.tags]
};
