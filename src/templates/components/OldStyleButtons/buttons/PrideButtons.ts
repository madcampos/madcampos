import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-pride')
export class PrideButton extends LitElement {
	static override styles = css`
		button {
			--rainbow-color: deeppink;
			--rainbow-text-color: white;
			animation: 6s steps(6) infinite;
		}

		button text { font-weight: bold; }

		button #button-text-path {
			stroke: var(--rainbow-color);
			stroke-dasharray: 0 6 28 100;
		}

		button .button-badge-bg { fill: var(--rainbow-color); }
		button .button-badge-text { fill: var(--rainbow-text-color); }
		button .emphasis-text { fill: var(--rainbow-color); }

		@media not (prefers-reduced-motion) { button { animation-name: rainbow; } }

		@media (prefers-contrast: more) { button { animation-name: none; } }

		@media (forced-colors: active) { button { animation-name: none; } }
	`;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/css/components/old-style-button.css" />

			<button type="button">
				<svg viewBox="0 0 88 31">
					<path id="button-base" d="M0 0h88v31H0z" />

					<path id="button-border-down" fill-opacity="0.4" d="M88 31H0l2-2h84l2 2Z" />
					<path id="button-border-right" fill-opacity="0.4" d="M88 0v31l-2-2V2l2-2Z" />
					<path id="button-border-up" fill-opacity="0.4" d="M0 0h88l-2 2H2L0 0Z" />
					<path id="button-border-left" fill-opacity="0.4" d="M0 31V0l2 2v27l-2 2Z" />

					<g>
						<path class="button-badge-bg" d="M2 2h7v27H2z" />
						<text x="-27.5" y="8" textLength="24" class="button-badge-text">
							<tspan dx="-1.5" fill="none" font-size="1">#</tspan>
							<tspan>PRIDE</tspan>
						</text>
					</g>

					<text x="32" y="10">This site is</text>

					<g transform="rotate(6) translate(-4 -1)">
						<g transform="translate(0, 1.5)">
							<path d="M21,23C36.333,12 58,14 58,14" fill="none" id="button-text-path" stroke-linecap="round" />
						</g>
						<text x="32" y="9" class="emphasis-text"><textPath href="#button-text-path" startOffset="-12">LGBTQ+</textPath></text>
					</g>

					<g>
						<clipPath id="button-pride-icon-clip">
							<path id="button-pride-icon-square" d="M56 2h30v27H56z" />
						</clipPath>
						<g clip-path="url(#button-pride-icon-clip)">
							<path fill="#6d2380" d="M56 2h42.52v27H56z" />
							<path fill="#2c58a4" d="M56 2h42.52v22.5H56z" />
							<path fill="#78b82a" d="M56 2h42.52v18H56z" />
							<path fill="#efe524" d="M56 2h42.52v13.5H56z" />
							<path fill="#f28917" d="M56 2h42.52v9H56z" />
							<path fill="#e22016" d="M56 2h42.52v4.5H56z" />
							<path d="M67.161 2H56v27h11.161l12.508-13.5L67.161 2Z" />
							<path fill="#945516" d="M64.539 2H56v27h8.539l12.508-13.5L64.539 2Z" />
							<path fill="#7bcce5" d="M61.953 2H56v27h5.953l12.508-13.5L61.953 2Z" />
							<path fill="#f4aec8" d="M59.366 2H56v27h3.366l12.508-13.5L59.366 2Z" />
							<path fill="#fff" d="M56 2v27h.78l12.472-13.5L56.78 2H56Z" />
							<path fill="#fdd817" d="M56 27.016 66.665 15.5 56 3.949v23.067Z" />
							<circle cx="59.933" cy="15.5" r="2.835" fill="none" stroke="#66338b" />
						</g>
					</g>
				</svg>
			</button>
		`;
	}
}
