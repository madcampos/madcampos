import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import defaultImage from '../assets/images/logo/logo-micro.png';
import { listAllTalks } from '../utils/talks.ts';

export const GET: APIRoute = async (context) => {
	const siteImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	const talksUrl = new URL('/talks/', context.url).href;

	const allTalks = await listAllTalks();
	const items = await Promise.all(allTalks.map(async (talk) =>
		`<entry>
			<id>${new URL(`#${talk.id}`, context.url).href}</id>
			<title><![CDATA[${talk.data.draft ? 'DRAFT - ' : ''}${talk.data.title}]]></title>
			<updated>${(talk.data.date ?? new Date()).toISOString()}</updated>
			<published>${(talk.data.date ?? new Date()).toISOString()}</published>
			<link rel="alternate" type="text/html" href="${new URL(`#${talk.id}`, talksUrl).href}" />
			<content type="html"><![CDATA[${await talk.renderString()}]]></content>
		</entry>`
	));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Site Changelog</title>
			<subtitle>Changelog (Version History) for Marco Campos' Website, containing all recent changes.</subtitle>
			<id>${context.url}</id>
			<link rel="alternate" type="text/html" href="${talksUrl}" />
			<link rel="self" type="application/atom+xml" href="${context.url}" />
			<updated>${new Date(allTalks[0]?.data.date ?? new Date()).toISOString()}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${new URL(siteImage.src, context.url).href}</logo>
			<icon>${new URL(siteImage.src, context.url).href}</icon>
			<author>
				<name>Marco Campos</name>
				<email>me@madcampos.dev</email>
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
