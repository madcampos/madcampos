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
				<css-naked-day hidden>
					<div id="css-banner">
						<hr />
						<h2>Why this website looks so weird?</h2>
						<p>We are celebrating CSS Naked Day!</p>
						<p>Find out more on <a href="/blog/2025/04/css-naked-day-2025">this blog post</a>.</p>
						<hr />
					</div>
					<script src="/js/components/css-naked-day.mjs" type="module"></script>
				</css-naked-day>

				${header}

				<main>
					${body}

					<iab-escape>
						<dialog tabindex="0">
							<h2>It's a trap!</h2>
							<div>
								<p>You are locked inside an In-App Browser.</p>
								<p>
									Those are made to lock you inside a platform and control all your data.
									<br />
									They may promise you privacy, but dont'respect that.
								</p>
								<p>Tap the link below to open this page in your default browser.</p>
							</div>
							<a href="#" target="_blank">Escape this trap</a>
						</dialog>
						<script src="/js/components/iab-escape.mjs" type="module"></script>
					</iab-escape>
				</main>

				<footer id="page-footer">
					${footer}
				</footer>
				${svgEffects}
			</body>
		</html>
	`;
}
