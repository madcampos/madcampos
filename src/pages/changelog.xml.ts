import type { APIRoute, MarkdownInstance } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';

import defaultImage from '../assets/images/logo/logo-micro.png';
import { BLOG } from '../constants.ts';

export const GET: APIRoute = async (context) => {
	const siteImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const baseUrl = new URL(context.site!);
	const changelogUrl = new URL('/changelog/', baseUrl).toString();
	const feedUrl = new URL('./changelog.xml', baseUrl).toString();

	baseUrl.protocol = 'https:';

	const allLogs = (await getCollection('changelog')).sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateA.getTime() - dateB.getTime());
	const changelogFiles = import.meta.glob<MarkdownInstance<{}>>('../content/changelog/*.md', { eager: true });

	const items = await Promise.all(allLogs.map(async (changelog) => {
		const [, changelogMarkdown] = Object.entries(changelogFiles).find(([filePath]) => filePath.includes(changelog.id)) ?? [];
		const compiledMarkdown = await changelogMarkdown?.compiledContent() ?? '';
		const changelogContent = compiledMarkdown.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

		return `<entry>
			<id>${new URL(`#${changelog.slug}`, changelogUrl).toString()}</id>
			<title>${changelog.id}${changelog.data.versionName ? ` - ${changelog.data.versionName}` : ''}</title>
			<updated>${changelog.data.date.toISOString()}</updated>
			<published>${changelog.data.date.toISOString()}</published>
			<link rel="alternate" type="text/html" href="${new URL(`#${changelog.slug}`, changelogUrl).toString()}" />
			<content type="html">${changelogContent}</content>
		</entry>`;
	}));

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
			<logo>${new URL(siteImage.src, baseUrl).toString().replaceAll('&', '&amp;')}</logo>
			<icon>${new URL(siteImage.src, baseUrl).toString().replaceAll('&', '&amp;')}</icon>
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
