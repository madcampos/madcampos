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
	constructor() {
		super();

		this.innerHTML = `
			<aside>
				<button type="button" popovertarget="theme-switcher-dialog">
					<svg width="1em" height="1em" aria-hidden="true">
						<path fill="currentColor" d="M7.42 15.54a1 1 0 0 0 0 1.41a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.41a1 1 0 0 0-1.42 0m0-8.49a1 1 0 0 0 0 1.41a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.41a1 1 0 0 0-1.42 0m4.95 10a1 1 0 1 0 1 1a1 1 0 0 0-1-1.05Zm-6-6a1 1 0 1 0 1 1a1 1 0 0 0-1-1.05Zm6-6a1 1 0 1 0 1 1a1 1 0 0 0-1-1.05Zm3.54 2.05a1 1 0 1 0 1.41 0a1 1 0 0 0-1.41-.05Zm6.3 0a11 11 0 1 0-7.85 15.74a3.87 3.87 0 0 0 2.5-1.65a4.2 4.2 0 0 0 .61-3.19a5.7 5.7 0 0 1-.1-1a5 5 0 0 1 3-4.56a3.84 3.84 0 0 0 2.06-2.25a4 4 0 0 0-.22-3.11Zm-1.7 2.44a1.9 1.9 0 0 1-1 1.09A7 7 0 0 0 15.37 17a7.3 7.3 0 0 0 .14 1.4a2.16 2.16 0 0 1-.31 1.65a1.8 1.8 0 0 1-1.21.8a8.7 8.7 0 0 1-1.62.15a9 9 0 0 1-9-9.28A9.05 9.05 0 0 1 11.85 3h.51a9 9 0 0 1 8.06 5a2 2 0 0 1 .09 1.52ZM12.37 11a1 1 0 1 0 1 1a1 1 0 0 0-1-1" />
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
				<label for="theme-input-${theme.id}" id="theme-label-${theme.id}">
					<input
						type="radio"
						name="theme"
						required
						value="${theme.id}"
						id="theme-input-${theme.id}"
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
						<g id="theme-image-${theme.id}">
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
							href="#theme-image-${theme.id}"
							display="none"
						/>
					</svg>
					<strong>${theme.name}</strong>
					<small><em>${theme.description}</em></small>
					<small ${theme.accessible ? 'hidden' : ''}>
						<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
							<path fill="currentColor" d="M12 16a1 1 0 1 0 1 1a1 1 0 0 0-1-1m10.67 1.47l-8.05-14a3 3 0 0 0-5.24 0l-8 14A3 3 0 0 0 3.94 22h16.12a3 3 0 0 0 2.61-4.53m-1.73 2a1 1 0 0 1-.88.51H3.94a1 1 0 0 1-.88-.51a1 1 0 0 1 0-1l8-14a1 1 0 0 1 1.78 0l8.05 14a1 1 0 0 1 .05 1.02ZM12 8a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1"/>
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
