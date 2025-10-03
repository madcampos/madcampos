import type { RenderFunction } from '../../lib/StaticSiteHandler.ts';
import type { ChangelogMetadata } from '../../src/data/changelog.ts';

export const render: RenderFunction = async (assets, { collections, url }) => {
	const allLogs = await collections.list<ChangelogMetadata>(assets, 'changelog');

	const items = Object.values(allLogs).map(async ({ metadata, contents, id }) =>
		`<entry>
			<id>${new URL(`#${id}`, url).toString()}</id>
			<title><![CDATA[${metadata.draft ? 'DRAFT - ' : ''}${metadata.title}]]></title>
			<updated>${metadata.date}</updated>
			<published>${metadata.date}</published>
			<link rel="alternate" type="text/html" href="${new URL(`#${id}`, url).toString()}" />
			<content type="html"><![CDATA[${contents}]]></content>
		</entry>`
	);

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Site Changelog</title>
			<subtitle>Changelog (Version History) for Marco Campos' Website, containing all recent changes.</subtitle>
			<id>${url.href}</id>
			<link rel="alternate" type="text/html" href="${new URL('/changelog/', url).href}" />
			<link rel="self" type="application/atom+xml" href="${url.href}" />
			<updated>${Object.values(allLogs)[0]?.metadata.date}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${new URL('/assets/social/social.png', url).href}</logo>
			<icon>${new URL('/assets/social/social.png', url).href}</icon>
			<author>
				<name>Marco Campos</name>
				<email>me@madcampos.dev</email>
				<uri>https://madcampos.dev/</uri>
			</author>
			${items.join('\n')}
		</feed>
	`;

	return new Response(atomFeed, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};
