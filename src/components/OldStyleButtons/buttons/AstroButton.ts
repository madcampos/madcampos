import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-astro')
export class AstroButton extends LitElement {
	static override styles = css`
		button #button-text-path {
			stroke: deeppink;
			stroke-dasharray: 0 6 28 100;
		}

		button .emphasis-text {
			fill: deeppink;
			font-size: 11px;
		}

		button #button-astro-icon-square { fill: url(#netscape-gradient); }

		@media (prefers-contrast: more), (forced-colors: active) {
			button #button-text-path { stroke: var(--theme-color); }
			button .emphasis-text { fill: var(--theme-color); }
			button #netscape-gradient stop { stop-color: var(--theme-color); }
			button #astro-icon-fire stop { stop-color: var(--text-color); }
			button #astro-icon path:last-child { fill: var(--dark-bg-color); }
			button circle {
				fill: var(--bg-color);
				stroke: var(--text-color);
			}
		}
	`;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/components/old-style-buttons/styles.css" />

			<button type="button">
				<svg viewBox="0 0 88 31">
					<linearGradient id="netscape-gradient" x1="0" x2="0" y1="0" y2="108" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="teal" />
						<stop offset="0.25" stop-color="darkturquoise" />
						<stop offset="0.5" stop-color="skyblue" />
						<stop offset="0.75" stop-color="lightcyan" />
						<stop offset="1" stop-color="orange" />
					</linearGradient>
					<linearGradient
						id="astro-icon-fire"
						x1="0"
						x2="1"
						y1="0"
						y2="0"
						gradientTransform="matrix(10.023 -4.72414 4.72414 10.023 11.218 26.988)"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0" stop-color="#d83333" />
						<stop offset="1" stop-color="#f041ff" />
					</linearGradient>

					<path id="button-base" d="M0 0h88v31H0z" />

					<path id="button-border-down" fill-opacity="0.4" d="M88 31H0l2-2h84l2 2Z" />
					<path id="button-border-right" fill-opacity="0.4" d="M88 0v31l-2-2V2l2-2Z" />
					<path id="button-border-up" fill-opacity="0.4" d="M0 0h88l-2 2H2L0 0Z" />
					<path id="button-border-left" fill-opacity="0.4" d="M0 31V0l2 2v27l-2 2Z" />

					<text x="60" y="10">Built with</text>

					<g transform="rotate(10) translate(25 -7)">
						<g transform="translate(0, 1.5)">
							<path d="M21,23C36.333,12 58,14 58,14" fill="none" id="button-text-path" stroke-linecap="round" />
						</g>
						<text x="32" y="9" class="emphasis-text" font-size="11">
							<textPath href="#button-text-path" startOffset="-14">Astro!</textPath>
						</text>
					</g>

					<path d="M2 2h27v27H2z" id="button-astro-icon-square" />
					<clipPath id="button-astro-icon-clip"><use xlink:href="#button-astro-icon-square" /></clipPath>
					<circle clip-path="url(#button-astro-icon-clip)" cx="15.5" cy="39.377" r="23.877" stroke="white" paint-order="stroke" />
					<g id="astro-icon">
						<path
							fill="url(#astro-icon-fire)"
							d="M11.413 19.196c-.437 1.437-.127 3.436.908 4.379v-.035l.034-.092c.127-.609.621-.988 1.254-.965.585.011.92.322.999 1 .035.253.035.506.046.77v.081c0 .575.161 1.126.483 1.609.288.46.69.815 1.23 1.057l-.023-.046-.023-.092c-.402-1.207-.115-2.045.942-2.758l.322-.219.713-.471a3.49 3.49 0 0 0 1.471-2.494 2.99 2.99 0 0 0-.126-1.276l-.173.115c-1.597.85-3.425 1.15-5.195.805-1.069-.162-2.103-.46-2.874-1.357l.012-.011Z"
						/>
						<path
							fill="white"
							d="M6.402 18.943s3.069-1.495 6.149-1.495l2.333-7.195c.081-.345.334-.575.621-.575.288 0 .529.23.621.586l2.322 7.184c3.655 0 6.15 1.495 6.15 1.495L19.368 4.69c-.138-.425-.403-.69-.736-.69h-6.253c-.334 0-.575.265-.736.69L6.402 18.943Z"
						/>
					</g>
				</svg>
			</button>
		`;
	}
}
