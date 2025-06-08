import { getCollection, render } from 'astro:content';

export async function listAllProjects() {
	const projectEntries = await getCollection('projects');

	const projects = projectEntries.filter((talk) => !talk.data.draft).sort((first, second) => first.data.title.localeCompare(second.data.title));
	const projectsWithRender = projects.map((project) => ({
		...project,
		render: async () => render(project)
	}));

	return projectsWithRender;
}
