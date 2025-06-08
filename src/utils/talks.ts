import { getCollection, render } from 'astro:content';

export async function listAllTalks() {
	const talkEntries = await getCollection('talks');
	const talks = talkEntries.filter((talk) => !talk.data.draft).sort((first, second) =>
		(second.data.date?.getTime() ?? 0) - (first.data.date?.getTime() ?? 0) || first.data.title.localeCompare(second.data.title, 'en-US')
	);
	const talksWithRender = talks.map((talk) => ({
		...talk,
		render: async () => render(talk)
	}));

	return talksWithRender;
}
