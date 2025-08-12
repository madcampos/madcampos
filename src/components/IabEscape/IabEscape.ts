import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('iab-escape')
export class IabEscape extends LitElement {
	static override styles = css`
		#iab-escape[open] {
			display: flex;
			flex-direction: column;
			justify-content: center;
			border: var(--border-color) var(--border-style) var(--border-width);
			border-radius: var(--border-radius);
			background-color: var(--dark-bg-color);
			padding: var(--spacing-large);
			width: clamp(10rem, 70vw, 35rem);
			height: clamp(10rem, 70vh, 35rem);
			overscroll-behavior: contain;
			text-align: center;
		}

		#iab-escape::backdrop {
			backdrop-filter: blur(1rem);
			background-color: rgba(0, 0, 0, 0.5);
		}
	`;

	protected override render() {
		return html`
			<dialog id="iab-escape" tabindex="0">
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
			<script src="/components/iab-escape/script.mjs" type="module"></script>
		`;
	}
}
