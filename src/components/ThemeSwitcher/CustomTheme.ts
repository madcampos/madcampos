import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('custom-theme')
export class CustomTheme extends LitElement {
	@property({ type: Boolean, attribute: 'is-accessible' })
	isAccessible = false;

	@property({ type: Boolean, attribute: 'dual-theme' })
	isDualTheme = false;

	@property({ type: String })
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	override id = Math.trunc(Math.random() * 1000).toString(16);

	protected override render() {
		return html`
			<link rel="stylesheet" href="/components/themes/styles.css" />

			<label
				for="${`theme-input-${this.id}`}"
				id="${`theme-label-${this.id}`}"
				class="theme-label"
			>
				<input
					type="radio"
					name="theme"
					value="${this.id}"
					id="${`theme-input-${this.id}`}"
					required
				/>

				<svg
					viewBox="0 0 100 70"
					class="theme-preview"
					data-theme="${this.isDualTheme ? 'light' : this.id}"
					role="presentation"
					width="100"
					height="70"
					display="none"
				>
					<g>
						<rect class="theme-preview-bg" x="0" y="0" width="100" height="70" />

						<text class="theme-preview-text theme-preview-header-text" x="5" y="30" role="presentation">Aa</text>
						<text class="theme-preview-text theme-preview-text-text" x="5" y="60" role="presentation">Aa</text>

						<rect class="theme-preview-border theme-preview-dark-bg" x="60" y="20" width="25" height="35" />
						<circle class="theme-preview-border theme-preview-theme-color" cx="60" cy="20" r="10" />
						<circle class="theme-preview-border theme-preview-accent-color" cx="60" cy="55" r="10" />
						<circle class="theme-preview-border theme-preview-complementary-color" cx="85" cy="20" r="10" />
						<circle class="theme-preview-border theme-preview-secondary-color" cx="85" cy="55" r="10" />
					</g>

					<g class="dual-theme" hidden>
						<clipPath id="theme-preview-system-mask">
							<polygon points="0,70 100,0 100,70" />
						</clipPath>
						<g data-theme="dark" clip-path="url(#theme-preview-system-mask)">
							<rect class="theme-preview-bg" x="0" y="0" width="100" height="70" />

							<text class="theme-preview-text theme-preview-header-text" x="5" y="30" role="presentation">Aa</text>
							<text class="theme-preview-text theme-preview-text-text" x="5" y="60" role="presentation">Aa</text>

							<rect class="theme-preview-border theme-preview-dark-bg" x="60" y="20" width="25" height="35" />
							<circle class="theme-preview-border theme-preview-theme-color" cx="60" cy="20" r="10" />
							<circle class="theme-preview-border theme-preview-accent-color" cx="60" cy="55" r="10" />
							<circle class="theme-preview-border theme-preview-complementary-color" cx="85" cy="20" r="10" />
							<circle class="theme-preview-border theme-preview-secondary-color" cx="85" cy="55" r="10" />
						</g>
					</g>
				</svg>

				<strong><slot name="name"></slot></strong>
				<small><em><slot></slot></em></small>
				<small class="accessible-theme" hidden>
					<m-icon icon="uil:exclamation-triangle"></m-icon>
					<strong>Warning: Theme is not fully accessible</strong>
				</small>
			</label>
		`;
	}
}
