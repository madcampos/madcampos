import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-feed')
export class FeedButton extends LitElement {
	static override styles = css`
		button #button-base { fill: url('#button-feed-gradient'); }
		button text {
			fill: white;
			font-weight: bold;
		}

		button #button-text-path { stroke: maroon; }
		button .button-badge-bg { fill: maroon; }
		button .emphasis-text {
			fill: maroon;
			stroke: none;
		}

		button:hover #button-feed-gradient stop:nth-child(1) { stop-color: orangered; }
		button:hover #button-feed-gradient stop:nth-child(2) { stop-color: orange; }

		button:active #button-feed-gradient stop:nth-child(1) { stop-color: firebrick; }
		button:active #button-feed-gradient stop:nth-child(2) { stop-color: orange; }

		@media (prefers-contrast: more), (forced-colors: active) {
			button #button-base { fill: var(--bg-color); }
			button text { fill: var(--theme-color); }

			button #button-text-path { stroke: var(--text-color); }
			button .button-badge-bg { fill: var(--text-color); }
			button .button-badge-text { fill: var(--dark-bg-color); }
			button .emphasis-text { fill: var(--text-color); }
			button #rss-icon path { fill: var(--theme-color); }
			button #rss-icon path:last-child { fill: var(--bg-color); }
		}
	`;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/css/components/old-style-button.css" />

			<button type="button">
				<svg viewBox="0 0 88 31">
					<linearGradient id="button-feed-gradient" x1="0" x2="0" y1="0" y2="100%" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="orange" />
						<stop offset="1" stop-color="orangered" />
					</linearGradient>

					<linearGradient id="icon-rss-gradient" x1="0" x2="1" y1="0" y2="0" gradientTransform="rotate(45 23.224 80.325) scale(23.942)" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="#e3702d" />
						<stop offset=".11" stop-color="#ea7d31" />
						<stop offset=".35" stop-color="#f69537" />
						<stop offset=".5" stop-color="#fb9e3a" />
						<stop offset=".7" stop-color="#ea7c31" />
						<stop offset=".89" stop-color="#de642b" />
						<stop offset="1" stop-color="#d95b29" />
					</linearGradient>

					<path id="button-base" d="M0 0h88v31H0z" />

					<path id="button-border-down" fill-opacity="0.4" d="M88 31H0l2-2h84l2 2Z" />
					<path id="button-border-right" fill-opacity="0.4" d="M88 0v31l-2-2V2l2-2Z" />
					<path id="button-border-up" fill-opacity="0.4" d="M0 0h88l-2 2H2L0 0Z" />
					<path id="button-border-left" fill-opacity="0.4" d="M0 31V0l2 2v27l-2 2Z" />

					<g>
						<path class="button-badge-bg" d="M2 2h7v27H2z" />
						<text class="button-badge-text" x="-27.5" y="8" textLength="24">FEED</text>
					</g>

					<text x="35" y="10">Subscribe</text>

					<g transform="rotate(5) translate(2 1)">
						<g transform="translate(0, 1.5)">
							<path d="M21,23C36.333,12 58,14 58,14" fill="none" id="button-text-path" stroke-linecap="round" />
						</g>
						<text x="32" class="emphasis-text">
							<textPath href="#button-text-path" startOffset="-20">Now!</textPath>
						</text>
					</g>
					<g id="rss-icon">
						<path
							fill="#cc5d15"
							d="M83 10.51v9.98a6.013 6.013 0 0 1-6.01 6.01h-9.98A6.013 6.013 0 0 1 61 20.49v-9.98a6.013 6.013 0 0 1 6.01-6.01h9.98A6.013 6.013 0 0 1 83 10.51Z"
						/>
						<path
							fill="#f49c52"
							d="M82.568 10.394v10.204a5.473 5.473 0 0 1-5.47 5.47H66.894a5.473 5.473 0 0 1-5.47-5.47V10.394a5.473 5.473 0 0 1 5.47-5.47h10.204a5.473 5.473 0 0 1 5.47 5.47Z"
						/>
						<path
							fill="url(#icon-rss-gradient)"
							d="M82.151 10.504v10.007a5.142 5.142 0 0 1-5.14 5.14H67.004a5.142 5.142 0 0 1-5.14-5.14V10.504a5.142 5.142 0 0 1 5.14-5.14h10.007a5.142 5.142 0 0 1 5.14 5.14Z"
						/>
						<path
							fill="white"
							d="M64.787 7.769v3.009c6.593.004 12.017 5.428 12.022 12.021h3.009c-.009-8.244-6.795-15.023-15.039-15.023l.008-.007Zm0 5.067v2.923c3.864.005 7.04 3.185 7.04 7.048h2.923v-.008c0-5.469-4.501-9.97-9.971-9.97l.008.007Zm2.059 5.846a2.077 2.077 0 0 0-2.067 2.059c0 1.133.933 2.066 2.067 2.066a2.076 2.076 0 0 0 2.066-2.066 2.077 2.077 0 0 0-2.066-2.067v.008Z"
						/>
					</g>
				</svg>
			</button>
		`;
	}
}
