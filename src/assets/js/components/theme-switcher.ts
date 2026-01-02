import { SiteSettings } from '../settings.ts';

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

class ThemeSwitcher extends HTMLElement implements CustomElement {
	#id = Math.trunc(Math.random() * 1000000).toString(16);
	constructor() {
		super();

		this.innerHTML = `
			<aside>
				<button type="button" popovertarget="theme-switcher-dialog">
					<svg
						viewBox="0 0 24 24"
						width="1em"
						height="1em"
						aria-hidden="true"
						data-icon="mingcute:palette-3-line"
					>
						<path fill="currentColor" d="M11 3c.48 0 .922.17 1.267.452l4.831 2.79c.416.24.713.607.87 1.024l2.79 4.832a2 2 0 0 1-.732 2.732l-9.447 5.455A5.1 5.1 0 0 1 8.021 21a5.06 5.06 0 0 1-2.602-.718a5 5 0 0 1-1.412-1.273A4.98 4.98 0 0 1 3 16V5a2 2 0 0 1 2-2zm-.053 2H5v11c0 1.625 1.362 3 3 3c1.634 0 3-1.374 3-3V5.03zM8 14.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m9.238-4.5l-3.578 6.196l5.366-3.098zM13 6.185v7.155L16.083 8l-.03-.052z" />
					</svg>
					<sr-only>Theme Switcher</sr-only>
				</button>

				<dialog id="theme-switcher-dialog" popover>
					<form action="./" method="get">
						<header>
							<h2>Choose a theme</h2>
						</header>
						<div id="theme-list"></div>

						<footer>
							<button type="submit" popovertarget="theme-switcher-dialog" popovertargetaction="hide">Apply theme</button>
						</footer>
					</form>
				</dialog>
			</aside>
		`;
	}

	connectedCallback() {
		this.querySelector('#theme-list')?.insertAdjacentHTML(
			'afterbegin',
			themes.map((theme) => `
				<label for="theme-input-${theme.id}-${this.#id}" id="theme-label-${theme.id}-${this.#id}">
					<input
						type="radio"
						name="theme"
						required
						value="${theme.id}"
						id="theme-input-${theme.id}-${this.#id}"
					/>
					<svg
						viewBox="0 0 100 70"
						data-theme="${theme.id === 'system' ? 'light' : theme.id}"
						role="presentation"
						aria-hidden="true"
						width="100"
						height="70"
						${theme.dual ? 'data-dual-theme' : ''}
					>
						<g id="theme-image-${theme.id}-${this.#id}">
							<rect x="5" y="2.5" rx="3" width="90" height="30" fill="var(--surface-1)" stroke="var(--surface-3)" />
							<text x="10" y="27" font-size="30" fill="var(--text-1)">Aa</text>

							<circle cx="70" cy="10" r="5" fill="var(--theme-color)" />
							<circle cx="85" cy="10" r="5" fill="var(--secondary-color)" />
							<circle cx="70" cy="25" r="5" fill="var(--accent-color)" />
							<circle cx="85" cy="25" r="5" fill="var(--complementary-color)" />


							<rect x="5" y="35" rx="3" width="90" height="30" fill="var(--surface-2)" stroke="var(--surface-4)" />
							<text x="10" y="60" font-size="30" fill="var(--text-2)">Aa</text>

							<circle cx="70" cy="42.5" r="5" fill="var(--theme-color)" />
							<circle cx="85" cy="42.5" r="5" fill="var(--secondary-color)" />
							<circle cx="70" cy="57.5" r="5" fill="var(--accent-color)" />
							<circle cx="85" cy="57.5" r="5" fill="var(--complementary-color)" />
						</g>
						<clipPath id="theme-preview-system-mask">
							<polygon points="0,70 100,0 100,70" />
						</clipPath>
						<use
							data-theme="dark"
							clip-path="url(#theme-preview-system-mask)"
							href="#theme-image-${theme.id}-${this.#id}"
							display="none"
						/>
					</svg>
					<strong>${theme.name}</strong>
					<small><em>${theme.description}</em></small>
					<small ${theme.accessible ? 'hidden' : ''}>
						<svg
							width="1em"
							height="1em"
							viewBox="0 0 24 24"
							aria-hidden="true"
							data-icon="mingcute:alert-line"
						>
							<path fill="currentColor" d="m13.299 3.148l8.634 14.954a1.5 1.5 0 0 1-1.299 2.25H3.366a1.5 1.5 0 0 1-1.299-2.25l8.634-14.954c.577-1 2.02-1 2.598 0M12 4.898L4.232 18.352h15.536zM12 15a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-7a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1" />
						</svg>
						<strong>Warning: Theme is not fully accessible</strong>
					</small>
				</label>
			`).join('')
		);

		if (SiteSettings.theme) {
			const themeInput = this.querySelector<HTMLInputElement>(`input[type="radio"][value="${SiteSettings.theme}"]`);

			if (themeInput) {
				themeInput.checked = true;
			}
		}

		this.querySelector('form')?.addEventListener('submit', (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			this.querySelector<HTMLDialogElement>('#theme-switcher-dialog')?.hidePopover();

			const theme = new FormData(evt.target as HTMLFormElement).get('theme') as string;

			SiteSettings.theme = theme;
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('theme-switcher')) {
	customElements.define('theme-switcher', ThemeSwitcher);
}
