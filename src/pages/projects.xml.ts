import type { APIRoute } from 'astro';
import { encodeEmail } from '../utils/email.ts';
import { listAllProjects } from '../utils/projects.ts';

export const GET: APIRoute = async (context) => {
	const projectsUrl = new URL('/projects/', context.url).href;

	const allProjects = await listAllProjects();
	const items = await Promise.all(allProjects.map(async (project) =>
		`<entry>
			<id>${new URL(`#${project.id}`, context.url).href}</id>
			<title><![CDATA[${project.data.draft ? 'DRAFT - ' : ''}${project.data.title}]]></title>
			<updated>${(project.data.updatedAt ?? project.data.createdAt).toISOString()}</updated>
			<published>${project.data.createdAt.toISOString()}</published>
			<link rel="alternate" type="text/html" href="${new URL(`#${project.id}`, projectsUrl).href}" />
			<content type="html"><![CDATA[${await project.renderString()}]]></content>
		</entry>`
	));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Site Changelog</title>
			<subtitle>Changelog (Version History) for Marco Campos' Website, containing all recent changes.</subtitle>
			<id>${context.url}</id>
			<link rel="alternate" type="text/html" href="${projectsUrl}" />
			<link rel="self" type="application/atom+xml" href="${context.url}" />
			<updated>${new Date(allProjects[0]?.data.updatedAt ?? new Date()).toISOString()}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${new URL('/assets/images/logo-micro.png', context.url).href}</logo>
			<icon>${new URL('/assets/images/logo-micro.png', context.url).href}</icon>
			<author>
				<name>Marco Campos</name>
				<email>${encodeEmail(true)}</email>
				<uri>https://madcampos.dev/</uri>
			</author>
			${items.join('\n')}
		</feed>
	`;

	return new Response(atomFeed, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};
