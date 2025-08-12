import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

interface SiteTheme {
	id: string;
	name: string;
	description: string;
	accessible?: boolean;
	dual?: boolean;
}

const themes: SiteTheme[] = [
	{
		id: 'system',
		name: 'System Default',
		description: 'The default theme for the operating system, either light or dark.',
		accessible: true,
		dual: true
	},
	{
		id: 'light',
		name: 'Light',
		description: 'The default light theme.',
		accessible: true
	},
	{
		id: 'dark',
		name: 'Dark',
		description: 'The default dark theme.',
		accessible: true
	},
	{
		id: 'high-contrast',
		name: 'High Contrast',
		description: 'A high contrast dark and yellow theme.',
		accessible: true
	},
	{
		id: 'uwu',
		name: 'UwU',
		description: 'A cute anime inspired theme.'
	},
	{
		id: 'y2k',
		name: 'Y2K',
		description: "A theme inspired on the 90's internet."
	},
	{
		id: 'hacker',
		name: 'Hacker',
		description: 'A theme inspired by old CRT monitors.'
	},
	// {
	// 	id: 'cork-board',
	// 	name: 'Cork Board',
	// 	description: 'A theme inspired in a skeumorphic corkboard.'
	// },
	// {
	// 	id: 'mecha',
	// 	name: 'Mecha',
	// 	description: 'A post apocaliptic mecha theme.'
	// },
	{
		id: 'debug',
		name: 'DEBUG',
		description: 'Not a real theme, just some debugging styles.',
		accessible: true
	}
];

@customElement('theme-switcher')
export class ThemeSwitcher extends LitElement {
	static override styles = css`
		@layer components {
			aside:not([hidden]) {
				/* INFO: fix for safari */
				display: inline-block;
				align-self: center;
			}

			/* TODO: fix */
			body:not(.js-enabled) aside { display: none; }

			aside button {
				display: flex;
				justify-content: center;
				align-items: center;
				border: var(--border-style) var(--border-width) var(--theme-color);
				border-radius: 100vmax;
				background: var(--bg-color);
				padding: var(--spacing-medium);
				width: var(--button-size);
				height: var(--button-size);
				color: var(--theme-color);
			}

			aside button:focus-visible {
				border-color: var(--text-color);
				background-color: var(--theme-color);
				color: var(--text-color);
			}

			#theme-switcher button:hover {
				outline-color: var(--accent-color);
				border-color: var(--accent-color);
				background-color: var(--dark-bg-color);
				color: var(--accent-color);
			}

			aside button:active {
				outline-color: var(--text-color);
				border-color: var(--text-color);
				background-color: var(--accent-color);
				color: var(--text-color);
			}

			aside button m-icon {
				width: 100%;
				height: 100%;
				pointer-events: none;
			}

			dialog {
				box-sizing: border-box;
				border: var(--border-color) var(--border-style) var(--border-width);
				border-radius: var(--border-radius);
				background-color: var(--dark-bg-color);
				width: clamp(10rem, 70vw, 35rem);
				height: clamp(10rem, 70vh, 35rem);
				overscroll-behavior: contain;
			}

			dialog::backdrop {
				backdrop-filter: blur(1rem);
				background-color: rgba(0, 0, 0, 0.5);
			}

			dialog form {
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				padding: var(--spacing-medium);
				width: 100%;
				height: 100%;
			}

			dialog button {
				width: fit-content;
				height: fit-content;
			}

			#theme-list {
				display: flex;
				flex-grow: 1;
				flex-wrap: wrap;
				justify-content: center;
				container-name: theme-switcher;
				container-type: size;
				overflow: auto;
				overscroll-behavior: contain;
			}
		}
	`;

	protected override render() {
		const themeMap = themes.map(
			({ description, id, name, accessible, dual }) =>
				html`
					<custom-theme
						id="${id}"
						?is-accessible="${accessible}"
						?dual-theme="${dual}"
					>
						<span slot="name">${name}</span>
						<span>${description}</span>
					</custom-theme>
				`
		);

		return html`
			<aside id="theme-switcher" hidden>
				<script src="/components/themes/script.mjs" type="module"></script>

				<button type="button" popovertarget="theme-switcher-dialog" aria-label="Theme Switcher">
					<m-icon icon="uil:palette"></m-icon>
				</button>

				<dialog id="theme-switcher-dialog" popover>
					<form action="./" method="get">
						<header>
							<h2>Choose a theme</h2>
						</header>
						<div id="theme-list">
							${themeMap}
						</div>

						<footer>
							<button type="submit" popovertarget="theme-switcher-dialog" popovertargetaction="hide">Apply theme</button>
						</footer>
					</form>
				</dialog>
			</aside>
		`;
	}
}
