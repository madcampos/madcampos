import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-js')
export class JsButton extends LitElement {
	static override styles = css`
		@keyframes js {
			from { --opacity: 1; }
			to { --opacity: 0; }
		}

		button { animation: 3s steps(2) infinite; }
		button #button-base { fill: tan; }
		button text {
			font-weight: bold;
			font-size: 7px;
			font-family: var(--button-font-didone);
		}

		button tspan:nth-child(1) {
			fill: brown;
			font-size: 10px;
			font-family: var(--button-font-slab);
		}

		button #button-warning-icon { opacity: var(--opacity); }

		button:hover #button-base { fill: peru; }

		button:active #button-base { fill: maroon; }
		button:active text { fill: tan; }
		button:active tspan:nth-child(1) { fill: white; }

		@media not (prefers-reduced-motion) { button { animation-name: js; } }

		@media (prefers-contrast: more), (forced-colors: active) {
			button { animation-name: none; }
			button #button-base { fill: var(--theme-color); }
			button text { fill: var(--dark-bg-color); }
			button tspan:nth-child(1) { fill: var(--bg-color); }

			button #button-warning-icon > path:nth-child(1) { fill: var(--text-color); }
			button #button-warning-icon > path:nth-child(2) { fill: var(--accent-color); }
			button #button-warning-icon > g { stroke: var(--dark-bg-color); }

			button:hover #button-base { fill: var(--accent-color); }

			button:active #button-base { fill: var(--text-color); }
			button:active :is(text, tspan:nth-child(1)) { fill: var(--bg-color); }
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

					<text y="14">
						<tspan x="56">Warning:</tspan>
						<tspan x="56" dy="1.5em">Contains JavaScript</tspan>
					</text>
					<g id="button-warning-icon">
						<path
							fill="yellow"
							d="M13.272 5.412a1.786 1.786 0 0 1 3.073 0l9.221 18.398c.153.269.243.569.263.878a1.788 1.788 0 0 1-1.756 1.778H5.574a1.752 1.752 0 0 1-1.743-1.734c0-.313.091-.618.264-.878l9.177-18.442Z"
						/>
						<path
							fill="red"
							d="M14.903 16.786c0 .689-1.25 1.746-1.25 2.745l-.027.086s-.148.655-.637.655a.594.594 0 0 1-.354-.149c-.12-.112-.275.06-.251.21.073.6 1.385 2.53 2.369 2.53 1.126 0 2.122-1.35 2.21-1.826 0-.228-.382-.086-.382-.4 0-.267.233-.442.233-.793a.19.19 0 0 0-.195-.173c-.087 0-.211.061-.309.061-.375 0-.461-.341-.461-.692 0 0 .07.023.07-.724a2.707 2.707 0 0 0-.651-1.601.26.26 0 0 0-.164-.061c-.087 0-.201.039-.201.132"
						/>
						<g fill="none" stroke="black">
							<path d="M12.013 23.006a3.807 3.807 0 0 0 2.721 1.069 4.056 4.056 0 0 0 2.759-1.069m-6.331-1.099s-2.041-2.177-.097-5.053c0 0 .392.499.691.977.222.257.626.695.84.695h.008a.463.463 0 0 0 .458-.505v-.175a7.1 7.1 0 0 1 .7-3.343c.501-1.041 1.36.738.777-2.837 0 0 3.1 2.089 2.984 5.548 0 .253.113.447.388.447.27 0 1.094-.262 1.094-.515.019.019 1.224 2.546-.486 4.761" />
							<path d="M13.632 19.567s-.137.752-.682.7a1.26 1.26 0 0 1-.28-.112c-.15-.165-.309.038-.286.178a5.019 5.019 0 0 0 1.384 2.05c.625.557.426.314.449.314m1.196.029c.248-.142.485-.303.709-.481.359-.312.642-.702.828-1.139a.16.16 0 0 0 .01-.057.153.153 0 0 0-.146-.153.358.358 0 0 1-.228-.21c-.04-.101-.046-.14.136-.455a.733.733 0 0 0 .092-.42.217.217 0 0 0-.296-.122.442.442 0 0 1-.591-.193c-.11-.214-.143-.07-.007-.751a2.75 2.75 0 0 0-.653-2.03.253.253 0 0 0-.173-.061.183.183 0 0 0-.191.132" />
							<path d="M13.272 5.412a1.786 1.786 0 0 1 3.073 0l9.221 18.398c.153.269.243.569.263.878a1.788 1.788 0 0 1-1.756 1.778H5.574a1.752 1.752 0 0 1-1.743-1.734c0-.313.091-.618.264-.878l9.177-18.442Z" />
						</g>
					</g>
				</svg>
			</button>
		`;
	}
}
