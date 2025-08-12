import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

// TODO: load base styles

@customElement('old-style-buttons')
export class OldStyleButtons extends LitElement {
	static override styles = css`
		h2, summary {
			color: var(--theme-color);
			font-weight: bold;
			line-height: 1.2;
			font-family: var(--headers-font-family);
		}

		summary {
			display: flex;
			align-items: center;
			gap: var(--spacing-small);
			list-style: none;
		}

		summary::-webkit-details-marker { display: none; }
		summary::marker { display: none; }

		summary::before {
			--icon-size: 1.2em;
			display: inline-block;
			background-image: var(--details-icon);
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			width: var(--icon-size);
			height: var(--icon-size);
			content: '';
		}

		details[open] > summary::before { transform: rotate(90deg); }

		#old-buttons-label {
			display: inline-flex;
			margin: 0;
			width: 100%;
		}

		#old-buttons div {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			width: 100%;
		}
	`;

	protected override render() {
		return html`
			<details id="old-buttons">
				<summary>
					<h2 id="old-buttons-label">
						<m-icon name="monitor"></m-icon>
						<span>Old style internet buttons</span>
					</h2>
				</summary>
				<div>
					<old-button-ie dest="https://en.wikipedia.org/wiki/Browser_wars"></old-button-ie>
					<old-button-cc dest="https://creativecommons.org/licenses/by-nc-sa/4.0/"></old-button-cc>
					<old-button-astro dest="https://astro.build/"></old-button-astro>
					<old-button-feed dest="/blog/feed.xml"></old-button-feed>
					<old-button-css dest="https://developer.mozilla.org/en-US/docs/Web/CSS"></old-button-css>
					<old-button-js dest="https://developer.mozilla.org/en-US/docs/Web/JavaScript"></old-button-js>
					<old-button-html dest="https://developer.mozilla.org/en-US/docs/Web/HTML"></old-button-html>
					<old-button-aria dest="https://www.w3.org/WAI/standards-guidelines/wcag/"></old-button-aria>
					<old-button-powered dest="https://workers.cloudflare.com/"></old-button-powered>
					<old-button-writter dest="https://obsidian.md/"></old-button-writter>
					<old-button-pride dest="https://www.the519.org/support-the-519/donate/"></old-button-pride>
					<old-button-code dest="https://code.visualstudio.com/"></old-button-code>
					<old-button-graphic-design></old-button-graphic-design>
					<old-button-guestbook></old-button-guestbook>
				</div>
				<script src="/components/old-style-buttons/script.mjs"></script>
			</details>
		`;
	}
}
