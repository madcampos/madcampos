import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-powered')
export class PoweredButton extends LitElement {
	static override styles = css`
		button #button-base { fill: white; }
		button text {
			font-weight: bold;
			font-size: 8.5px;
			text-anchor: end;
		}

		button #icon-php text:nth-of-type(2) {
			dominant-baseline: middle;
			paint-order: stroke;
			font-style: italic;
			font-weight: bold;
			font-size: 18px;
			font-family: 'Arial', 'Helvetica', sans-serif;
			stroke: white;
			text-anchor: middle;
		}

		button:hover #button-base { fill: dimgray; }
		button:hover text { fill: white; }
		button:hover #icon-php text:nth-of-type(2) { stroke: black; }

		button:active #button-base { fill: black; }
		button:active text { fill: white; }
		button:active #icon-php text:nth-of-type(2) { stroke: black; }
	`;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/css/components/old-style-button.css" />

			<button type="button">
				<svg viewBox="0 0 88 31">
					<radialGradient id="icon-php-gradient" cx="0" cy="0" r="1" gradientTransform="translate(54.608 8.337) scale(27.5761)" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="#aeb2d5" />
						<stop offset=".3" stop-color="#aeb2d5" />
						<stop offset=".75" stop-color="#484c89" />
						<stop offset="1" stop-color="#484c89" />
					</radialGradient>

					<path id="button-base" d="M0 0h88v31H0z" />

					<path id="button-border-down" fill-opacity="0.4" d="M88 31H0l2-2h84l2 2Z" />
					<path id="button-border-right" fill-opacity="0.4" d="M88 0v31l-2-2V2l2-2Z" />
					<path id="button-border-up" fill-opacity="0.4" d="M0 0h88l-2 2H2L0 0Z" />
					<path id="button-border-left" fill-opacity="0.4" d="M0 31V0l2 2v27l-2 2Z" />

					<text y="14">
						<tspan x="40">Powered</tspan>
						<tspan x="38" dy="1em">by</tspan>
					</text>

					<g id="icon-php">
						<g>
							<path fill="url(#icon-php-gradient)" d="M42 15.5c0 6.101 9.402 11.047 21 11.047S84 21.601 84 15.5c0-6.101-9.402-11.047-21-11.047S42 9.399 42 15.5" />
							<path
								fill="#777bb3"
								d="M63 25.727c11.145 0 20.18-4.579 20.18-10.227 0-5.648-9.035-10.227-20.18-10.227S42.82 9.852 42.82 15.5c0 5.648 9.035 10.227 20.18 10.227"
							/>
						</g>
						<text x="100" y="100" class="hidden-text">Cloudflare Workers -</text>
						<text y="16.5" x="62">cfw</text>
					</g>
				</svg>
			</button>
		`;
	}
}
