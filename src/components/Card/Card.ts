import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

@customElement('m-card')
export class Card extends LitElement {
	@property({ type: String })
	url?: string;

	@property({ type: String })
	itemtype?: string;

	@property({ type: Boolean, attribute: 'draft' })
	isDraft?: boolean;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/css/components/card.css" />

			<article itemscope ?itemtype="${this.itemtype}">
				<div hidden class="card-meta">
					<meta itemprop="url" ?content="${this.url}" />
					<slot name="metadata"></slot>
				</div>

				<picture itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
					<slot name="image"></slot>
				</picture>

				<header>
					<div class="card-title">
						${when(this.isDraft, () => html`<draft-tag>Draft</draft-tag>`)}
						<a ?href="${this.url}" itemprop="name">
							<slot name="title"></slot>
						</a>
					</div>

					<aside class="card-subtitle">
						<slot name="subtitle"></slot>
					</aside>
				</header>

				<div class="card-content" itemprop="description">
					<slot></slot>
				</div>

				<aside class="card-links">
					<slot name="links"></slot>
				</aside>

				<footer>
					<slot name="footer"></slot>
				</footer>
			</article>
		`;
	}
}
