import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-ie')
export class IeButton extends LitElement {
	static override styles = css`
		button #button-text-path { stroke: red; }
		button .emphasis-text { fill: red; }
		button .button-badge-bg { fill: red; }

		button:hover #button-text-path { stroke: green; }
		button:hover .emphasis-text { fill: green; }
		button:hover .button-badge-bg { fill: green; }

		button:active #button-text-path { stroke: blue; }
		button:active .emphasis-text { fill: blue; }
		button:active .button-badge-bg { fill: blue; }

		@media (prefers-contrast: more), (forced-colors: active) {
			button #ie-logo { fill: var(--theme-color); }
			button #button-text-path { stroke: var(--theme-color); }
			button .emphasis-text { fill: var(--theme-color); }
			button .button-badge-bg { fill: var(--theme-color); }

			button:hover #button-text-path { stroke: var(--text-color); }
			button:hover .emphasis-text { fill: var(--text-color); }
			button:hover .button-badge-bg { fill: var(--text-color); }

			button:active #button-text-path { stroke: var(--accent-color); }
			button:active .emphasis-text { fill: var(--accent-color); }
			button:active .button-badge-bg { fill: var(--accent-color); }
		}

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
						<text x="-27.5" y="8" textLength="24" class="button-badge-text">BEST</text>
					</g>

					<g transform="translate(0, 1.5)">
						<path d="M21,23C36.333,12 58,14 58,14" fill="none" id="button-text-path" stroke-linecap="round" />
					</g>
					<text x="32" y="9">
						<tspan>Viewed on</tspan>
						<textPath href="#button-text-path" class="emphasis-text" startOffset="13">Any!</textPath>
						<tspan x="32" y="27">Browser</tspan>
					</text>

					<g>
						<path d="M59 2h27v27H59z" />
						<path
							id="ie-logo"
							fill="#1ebbee"
							d="M82.83 4.573c-1.807-1.628-5.902.325-8.161 1.645a12.727 12.727 0 0 0-2.035-.158c-2.856 0-5.159.841-6.91 2.424-1.991 1.824-3.095 4.211-3.095 6.97v.072c2.802-4.389 7.111-6.639 8.253-7.234.182-.085.29.133.121.216-.013.037-.013 0 0 0-1.921 1.151-5.484 4.483-7.796 9.28l-.002-.006c-1.464 3.023-2.699 7.27-.228 8.828 1.873 1.176 5.225-.214 7.922-1.978.651.093 1.338.14 2.059.141 4.978 0 8.47-2.747 9.717-6.754l-6.838-.011c-.287 1.414-1.248 2.171-2.747 2.171-1.884 0-3.18-1.031-3.263-3.419l12.979-.012c.024-.495-.035-.841-.035-1.225 0-4.475-2.679-7.974-7.037-9.089 1.773-1.103 5.092-2.736 6.69-1.432 1.2.972.54 3.011.252 3.85-.048.217.205.253.252.049.599-1.509.779-3.537-.097-4.328h-.001ZM70.279 24.526c-2.106 1.258-5.006 2.165-6.427 1.1-1.059-.798-.593-2.958.341-5.063a9.298 9.298 0 0 0 2.107 2.242c1.127.848 2.45 1.421 3.979 1.721m-.476-10.765c.036-2.075 1.523-2.975 3.083-2.975 1.645 0 2.975.948 2.975 2.975h-6.058Z"
						/>
					</g>
				</svg>
			</button>
		`;
	}
}
