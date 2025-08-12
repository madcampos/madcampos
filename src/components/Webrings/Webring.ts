import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('m-webring')
export class Webring extends LitElement {
	@property({ type: String })
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	override id = (Math.random() * 1000).toString(16);

	@property({ type: String, attribute: 'prev-link' })
	prevLink = '';

	@property({ type: String, attribute: 'next-link' })
	nextLink = '';

	@property({ type: String, attribute: 'random-link' })
	randomLink = '';

	protected override render() {
		const randomLink = this.randomLink
			? html`
				<li>
					<a rel="external" referrerpolicy="strict-origin" rel="external noopener" href="${this.randomLink}">
						<m-icon icon="uil:arrow-random"></m-icon>
						<span>Random website</span>
					</a>
				</li>
			`
			: '';

		return html`
			<link rel="stylesheet" href="/components/webring/styles.css" />

			<article id="${`${this.id}-card`}" aria-labelledby="${`${this.id}-header`}">
				<h3 id="${`${this.id}-header`}">
					<slot name="title"></slot>
				</h3>

				<blockquote>
					<slot></slot>
				</blockquote>

				<ul>
					<li class="webring-previous-website">
						<a rel="external" referrerpolicy="strict-origin" rel="external noopener" href="${this.prevLink}">
							<m-icon icon="uil:angle-left-b"></m-icon>
							<span>Previous website</span>
						</a>
					</li>
					${randomLink}
					<li class="webring-next-website">
						<a rel="external" referrerpolicy="strict-origin" rel="external noopener" href="${this.nextLink}">
							<span>Next website</span>
							<m-icon icon="uil:angle-right-b"></m-icon>
						</a>
					</li>
				</ul>
			</article>
		`;
	}
}
