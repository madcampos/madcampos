import { html, type ServerRenderedTemplate } from '@lit-labs/ssr';
import type { TemplateResult } from 'lit';

interface SiteWebRing {
	id: string;
	title: ServerRenderedTemplate | TemplateResult<1> | string;
	description: ServerRenderedTemplate | TemplateResult<1> | string;
	prevLink: string;
	nextLink: string;
	randomLink?: string;
}

const webringLinks: SiteWebRing[] = [
	{
		id: 'a11y-webring-club',
		title: 'a11y-webring.club',
		description: html`This site is a member of the <a rel="external" href="https://a11y-webring.club/">a11y-webring.club</a>.`,
		prevLink: 'https://a11y-webring.club/prev',
		nextLink: 'https://a11y-webring.club/next',
		randomLink: 'https://a11y-webring.club/random'
	}
];

const webringMap = webringLinks.map(({ id, title, description, prevLink, nextLink, randomLink }) => {
	const randomLinkTemplate = randomLink
		? html`
			<li>
				<a rel="external" referrerpolicy="strict-origin" rel="external noopener" href="${randomLink}">
					<m-icon icon="uil:arrow-random"></m-icon>
					<span>Random website</span>
				</a>
			</li>
		`
		: '';

	return html`
		<m-webring id="${id}">
			<article id="${`${id}-card`}" aria-labelledby="${`${id}-header`}">
				<h3 id="${`${id}-header`}">
					${title}
				</h3>

				<blockquote>
					${description}
				</blockquote>

				<ul>
					<li class="webring-previous-website">
						<a rel="external" referrerpolicy="strict-origin" rel="external noopener" href="${prevLink}">
							<m-icon icon="uil:angle-left-b"></m-icon>
							<span>Previous website</span>
						</a>
					</li>
					${randomLinkTemplate}
					<li class="webring-next-website">
						<a rel="external" referrerpolicy="strict-origin" rel="external noopener" href="${nextLink}">
							<span>Next website</span>
							<m-icon icon="uil:angle-right-b"></m-icon>
						</a>
					</li>
				</ul>
			</article>
		</m-webring>
	`;
});

export const webrings = html`
	<details id="webrings">
		<summary>
			<h2 id="webrings-label">
				<m-icon icon="uil:globe"></m-icon>
				<span>Webrings links</span>
			</h2>
		</summary>

		<div id="webrings-list">
			${webringMap}
		</div>
	</details>
`;
