interface ConstantsMap {
	url: string,
	title: string[],
	titleString: string,
	description: string,
	tags: string[],
	logoAltText?: {
		regular: string,
		mini: string,
		micro: string
	}
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
	],
	logoAltText: {
		regular: 'My moniker, "madcampos", on a monospaced font, in blue, between curly braces.',
		mini: 'The letters "madc" on a monospaced font, in blue, between curly braces.',
		micro: 'The letter "m" on a monospaced font, in blue, between curly braces.'
	}
};

export const ERROR: ConstantsMap = {
	url: '/404',
	title: ['404', ...GLOBALS.title],
	titleString: '404 — Not Found',
	description: '404 — Not Found',
	tags: GLOBALS.tags
};

export const OFFLINE: ConstantsMap = {
	url: '/offline',
	title: ['Offline Page', ...GLOBALS.title],
	titleString: 'Offline Page',
	description: 'Marco Campos — Offline Page',
	tags: GLOBALS.tags
};

export const BLOG: ConstantsMap = {
	url: '/blog',
	title: ['Blog', ...GLOBALS.title],
	titleString: "Marco Campos' Blog",
	description: "Marco Campos' Blog — A space where I talk about web development and other programming related (or not) things.",
	tags: ['blog', ...GLOBALS.tags],
	logoAltText: {
		regular: `Logo for madcampos' blog consisting of my moniker, "madcampos", on a monospaced font, in blue, between curly braces. Below it, a subtext of "blog" in orange on the lower right corner.`,
		mini: `Logo for madcampos' blog consisting of the letters "madc" on a monospaced font, in blue, between curly braces. Below it, a subtext of "blog" in orange on the lower right corner.`,
		micro: `Logo for madcampos' blog consisting of the letter "m" on a monospaced font, in blue, between curly braces. Below it, a subtext of "blog" in orange on the lower right corner.`
	}
};

export const BLOG_TAGS: ConstantsMap = {
	url: `${BLOG.url}/tags`,
	title: ['Tags', ...BLOG.title],
	titleString: "Tags for Marco Campos' blog",
	description: "Marco Campos' Blog — Tags for my blog posts",
	tags: BLOG.tags
};

export const BLOG_AUTHOR: ConstantsMap = {
	url: `${BLOG.url}/authors`,
	title: ['Authors', ...BLOG.title],
	titleString: "Authors for Marco Campos' blog",
	description: "Marco Campos' Blog — Authors for the blog",
	tags: BLOG.tags
};

export const PROJECTS: ConstantsMap = {
	url: '/projects',
	title: ['Projects', ...GLOBALS.title],
	titleString: 'Project Highlight',
	description: "Marco Campos' Projects — A list of projects I've worked on, or am currently working on. Mostly web development",
	tags: ['projects', ...GLOBALS.tags],
	logoAltText: {
		regular: `Logo for madcampos' projects consisting of my moniker, "madcampos", on a monospaced font, in blue, between curly braces. Below it, a subtext of "projects" in orange on the lower right corner.`,
		mini: `Logo for madcampos' projects consisting of the letters "madc" on a monospaced font, in blue, between curly braces. Below it, a subtext of "projects" in orange on the lower right corner.`,
		micro: `Logo for madcampos' projects consisting of the letter "m" on a monospaced font, in blue, between curly braces. Below it, a subtext of "projects" in orange on the lower right corner.`
	}
};

export const TALKS: ConstantsMap = {
	url: '/talks',
	title: ['Talks', ...GLOBALS.title],
	titleString: 'Talks, Presentations & Workshops',
	description: "Marco Campos' Talks — A list of talks I've given on meetups, conferences, or other events.",
	tags: ['talks', ...GLOBALS.tags],
	logoAltText: {
		regular: `Logo for madcampos' talks consisting of my moniker, "madcampos", on a monospaced font, in blue, between curly braces. Below it, a subtext of "talks" in orange on the lower right corner.`,
		mini: `Logo for madcampos' talks consisting of the letters "madc" on a monospaced font, in blue, between curly braces. Below it, a subtext of "talks" in orange on the lower right corner.`,
		micro: `Logo for madcampos' talks consisting of the letter "m" on a monospaced font, in blue, between curly braces. Below it, a subtext of "talks" in orange on the lower right corner.`
	}
};
