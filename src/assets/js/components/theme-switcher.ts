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
		id: 'low-contrast',
		name: 'Low Contrast',
		description: 'A low contrast light blue theme.',
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
				<button
					type="button"
					popovertarget="theme-switcher-dialog-${this.#id}"
					popoveraction="show-modal"
				>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#theme-switcher-icon" width="24" height="24" />
					</svg>
					<sr-only>Theme Switcher</sr-only>
				</button>

				<dialog id="theme-switcher-dialog-${this.#id}" popover>
					<header>
						<h2>Choose a theme</h2>
						<button
							type="button"
							popovertarget="theme-switcher-dialog-${this.#id}"
							popovertargetaction="hide"
						>
							<sr-only>Close Theme Switcher</sr-only>
							<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
								<use href="#theme-switcher-icon-close" width="24" height="24" />
							</svg>
						</button>
					</header>
					<form action="./" method="get">
						<dialog-content id="theme-list-${this.#id}"></dialog-content>

						<footer>
							<button
								type="submit"
								popovertarget="theme-switcher-dialog-${this.#id}"
								popovertargetaction="hide"
							>Apply theme</button>
						</footer>
					</form>
				</dialog>
			</aside>
		`;
	}

	connectedCallback() {
		this.querySelector(`#theme-list-${this.#id}`)?.insertAdjacentHTML(
			'afterbegin',
			themes.map((theme) => `
				<label for="theme-input-${theme.id}-${this.#id}" id="theme-label-${theme.id}-${this.#id}">
					<input
						type="radio"
						name="theme"
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
						<clipPath id="theme-preview-system-mask-${this.#id}">
							<polygon points="0,70 100,0 100,70" />
						</clipPath>
						<use
							data-theme="dark"
							clip-path="url(#theme-preview-system-mask-${this.#id})"
							href="#theme-image-${theme.id}-${this.#id}"
							display="none"
						/>
					</svg>
					<strong>${theme.name}</strong>
					<small><em>${theme.description}</em></small>
					<small ${theme.accessible ? 'hidden' : ''}>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#theme-switcher-icon-warning" width="24" height="24" />
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
			this.querySelector<HTMLDialogElement>(`#theme-switcher-dialog-${this.#id}`)?.hidePopover();

			const theme = new FormData(evt.target as HTMLFormElement).get('theme') as string;

			SiteSettings.theme = theme;
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('theme-switcher')) {
	customElements.define('theme-switcher', ThemeSwitcher);
}
