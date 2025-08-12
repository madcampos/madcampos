import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-guestbook')
export class GuestbookButton extends LitElement {
	static override styles = css`
		button { animation: 3s ease-in-out infinite; }
		button text {
			fill: black;
			font-weight: bold;
			font-size: 9px;
		}

		button .emphasis-text {
			fill: dodgerblue;
			transform: rotate(var(--rotate));
			transform-origin: 50% 50%;
			font-size: 10px;
		}

		button svg { fill: dodgerblue; }

		button:hover .emphasis-text { fill: orangered; }
		button:hover svg { fill: orangered; }

		button:active .emphasis-text { fill: magenta; }
		button:active svg { fill: magenta; }

		@media not (prefers-reduced-motion) { button { animation-name: swing; } }

		@media (prefers-contrast: more), (forced-colors: active) {
			button { animation-name: none; }
			button text { fill: var(--text-color); }
			button .emphasis-text { fill: var(--theme-color); }
			button svg { fill: var(--theme-color); }

			button:hover .emphasis-text { fill: var(--accent-color); }
			button:hover svg { fill: var(--accent-color); }

			button:active .emphasis-text { fill: var(--accent-color); }
			button:active svg { fill: var(--accent-color); }
		}
	`;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/components/old-style-buttons/styles.css" />

			<button type="button">
				<svg viewBox="0 0 88 31">
					<path id="button-base" d="M0 0h88v31H0z" />

					<path id="button-border-down" fill-opacity="0.4" d="M88 31H0l2-2h84l2 2Z" />
					<path id="button-border-right" fill-opacity="0.4" d="M88 0v31l-2-2V2l2-2Z" />
					<path id="button-border-up" fill-opacity="0.4" d="M0 0h88l-2 2H2L0 0Z" />
					<path id="button-border-left" fill-opacity="0.4" d="M0 31V0l2 2v27l-2 2Z" />

					<text x="55" y="12">Sign my</text>

					<text x="55" y="23" class="emphasis-text">Guestbook!</text>
					<svg width="20" height="20" x="5" y="5" viewBox="0 0 2048 2048">
						<path d="M1747 290q14 8 23 23t9 32q0 8-2 15t-5 14l-707 1415q-9 19-28 28l-173 87q-32 16-69 16h-9q-4 0-10-1l-47 94q-8 16-23 25t-34 10q-26 0-45-19t-19-45q0-12 7-30t16-37t20-37t15-28q-26-40-26-87v-165q0-16 7-29l576-1152l-65-32l-237 474q-8 16-23 25t-34 10q-26 0-45-19t-19-45q0-13 7-29l239-478q16-32 43-50t63-19q35 0 66 17t62 32l71-142q8-17 23-26t34-9q13 0 22 4q12-24 23-47t26-43t36-30t53-12q32 0 61 15l94 47q32 16 50 42t19 64q0 34-15 63t-30 59m-202-101l87 43l29-58l-87-43zm84 185l-192-96l-669 1337v150q0 11 8 19t19 8q4 0 16-5t29-13t35-17t36-19t30-16t19-10zm163 394q53 0 99 20t82 55t55 81t20 100q0 53-20 99t-55 82t-81 55t-100 20h-288l64-128h224q27 0 50-10t40-27t28-41t10-50q0-27-10-50t-27-40t-41-28t-50-10q-26 0-45-19t-19-45t19-45t45-19M128 1600q0 66 25 124t68 102t102 69t125 25h44q-5 15-8 31t-4 33q0 17 3 33t9 31h-44q-93 0-174-35t-142-96t-96-142t-36-175q0-93 35-174t96-142t142-96t175-36h224l-64 128H448q-66 0-124 25t-102 69t-69 102t-25 124" />
					</svg>
				</svg>
			</button>
		`;
	}
}
