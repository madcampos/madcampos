import type { APIRoute } from 'astro';
import cssBase from '../../assets/css/base.css?raw';
import cssFonts from '../../assets/css/fonts.css?raw';
import cssVars from '../../assets/css/vars.css?raw';
import cssXmlFeed from '../../assets/css/xml-feed.css?raw';
import feedXsl from '../../assets/feed.xsl?raw';

const feedWithCss = feedXsl.replace(
	'<!-- {{CSS}} -->',
	`<style>
${cssVars}
${cssFonts}
${cssBase}
${cssXmlFeed}
</style>`
);

const minifiedFeed = feedWithCss.replaceAll(/\t|\n/giu, '').replaceAll(/\s+/giu, ' ');

export const GET: APIRoute = () => {
	const body = minifiedFeed;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};
