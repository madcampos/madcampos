import { html, type ServerRenderedTemplate } from '@lit-labs/ssr';
import type { TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { svgEffects } from '../Effects/Effects.ts';
import { htmlHead } from '../HtmlHead/HtmlHead.ts';

interface Props {
	title: string;
	htmlTitle?: string[];
	baseUrl: string;
	url: string;
	description: string;
	tags?: string[];
	image?: string;
	imageAlt?: string;
	createdAt?: Date;
	updatedAt?: Date;
	hasFeed?: boolean;
	pageSchema?: string;

	header?: ServerRenderedTemplate | TemplateResult;
	body: ServerRenderedTemplate | TemplateResult;
	footer?: ServerRenderedTemplate | TemplateResult;

	styles?: string[];
}

export function baseLayout({
	pageSchema = 'WebPage',
	title,
	htmlTitle,

	baseUrl,
	url,

	description,
	tags,

	image,
	imageAlt,

	createdAt,
	updatedAt,

	hasFeed = false,

	header,
	body,
	footer,

	styles
}: Props) {
	return html`
		<!DOCTYPE html>
		<html lang="en-US" itemscope itemtype="https://schema.org/${pageSchema}">
			${htmlHead({ title, htmlTitle, baseUrl, url, description, tags, image, imageAlt, createdAt, updatedAt, hasFeed, styles })}
			<body class="${classMap({ 'h-entry': hasFeed })}">
				<css-naked-day></css-naked-day>
				${header}
				<main>
					${body}
					<iab-escape></iab-escape>
				</main>

				<footer id="page-footer">
					${footer}
				</footer>
				${svgEffects}
			</body>
		</html>
	`;
}
