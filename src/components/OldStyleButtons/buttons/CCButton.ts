import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-cc')
export class CCButton extends LitElement {
	static override styles = css`
		button text {
			font-weight: bold;
			font-size: 7px;
		}

		button text tspan:nth-child(2) {
			fill: darkorchid;
			font-size: 12px;
			font-family: var(--button-font-oldstyle);
		}

		button #button-base { fill: whitesmoke; }

		button:hover #button-base { fill: darkorchid; }
		button:hover text { fill: pink; }
		button:hover text tspan:nth-child(2) { fill: white; }

		button:active #button-base { fill: dimgray; }
		button:active text { fill: white; }
		button:active text tspan:nth-child(2) { fill: hotpink; }

		@media (prefers-contrast: more), (forced-colors: active) {
			button :is(text, text tspan:nth-child(2)) { fill: var(--bg-color); }
			button #button-base { fill: var(--text-color); }

			button:hover #button-base { fill: var(--bg-color); }
			button:hover :is(text, text tspan:nth-child(2)) { fill: var(--text-color); }

			button:active #button-base { fill: var(--dark-bg-color); }
			button:active :is(text, text tspan:nth-child(2)) { fill: var(--theme-color); }
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

					<text>
						<tspan x="50%" y="8">PAGE UNDER</tspan>
						<tspan x="50%" y="19">CC BY-NC-SA</tspan>
						<tspan x="50%" y="27">FREE TO SHARE</tspan>
					</text>
				</svg>
			</button>
		`;
	}
}
