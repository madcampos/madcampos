import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';

import defaultImage from '../assets/images/logo/logo-micro.png';
import { BLOG } from '../constants.ts';
import { listAllChangelogs } from '../utils/changelog.ts';
import { escapeHtmlTags, inlineMarkdownRender } from '../utils/markdown.ts';

export const GET: APIRoute = async (context) => {
	const siteImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const baseUrl = new URL(context.site!);
	const changelogUrl = new URL('/changelog/', baseUrl).toString();
	const feedUrl = new URL('./changelog.xml', baseUrl).toString();

	baseUrl.protocol = 'https:';

	const allLogs = await listAllChangelogs();
	const items = await Promise.all(allLogs.map(async (changelog) =>
		`<entry>
			<id>${new URL(`#${changelog.id}`, changelogUrl).toString()}</id>
			<title>${inlineMarkdownRender(escapeHtmlTags(changelog.title))}</title>
			<updated>${changelog.data.date.toISOString()}</updated>
			<published>${changelog.data.date.toISOString()}</published>
			<link rel="alternate" type="text/html" href="${new URL(`#${changelog.id}`, changelogUrl).toString()}" />
			<content type="html">${escapeHtmlTags(await changelog.renderString())}</content>
		</entry>`
	));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<?xml-stylesheet type="text/xsl" href="${new URL('feed.xsl', new URL(BLOG.url, baseUrl).toString()).toString()}"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Site Changelog</title>
			<subtitle>Changelog (Version History) for Marco Campos' Website, containing all recent changes.</subtitle>
			<id>${changelogUrl}</id>
			<link rel="alternate" type="text/html" href="${changelogUrl}" />
			<link rel="self" type="application/atom+xml" href="${feedUrl}" />
			<updated>${new Date(allLogs[0]?.data.date ?? new Date()).toISOString()}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${escapeHtmlTags(new URL(siteImage.src, baseUrl).toString())}</logo>
			<icon>${escapeHtmlTags(new URL(siteImage.src, baseUrl).toString())}</icon>
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
