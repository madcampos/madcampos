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
	}
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
];

class SiteDisplaySettings extends HTMLElement implements CustomElement {
	#id = Math.trunc(Math.random() * 1000000).toString(16);
	constructor() {
		super();

		this.innerHTML = `
			<aside>
				<button
					type="button"
					popovertarget="site-settings-dialog-${this.#id}"
					popoveraction="show-modal"
				>
					<sr-only>Open Settings</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#site-settings-icon" width="24" height="24" />
					</svg>
				</button>

				<dialog id="site-settings-dialog-${this.#id}" popover>
					<header>
						<h2>Site Settings</h2>
						<button
							type="button"
							popovertarget="site-settings-dialog-${this.#id}"
							popovertargetaction="hide"
						>
							<sr-only>Close Settings</sr-only>
							<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
								<use href="#site-settings-icon-close" width="24" height="24" />
							</svg>
						</button>
					</header>
					<form action="./" method="get">
						<dialog-content>
							<fieldset>
								<legend>Fonts</legend>
								<!-- TODO: text font -->
								<!-- TODO: headers font -->
								<!-- TODO: code font -->

								<!-- Font: https://en.wikipedia.org/wiki/Atkinson_Hyperlegible -->
								<!-- Font: https://en.wikipedia.org/wiki/OpenDyslexic -->
								<!-- Font: https://en.wikipedia.org/wiki/Andika_(typeface) -->
								<!-- Font: https://en.wikipedia.org/wiki/Comic_Neue -->
							</fieldset>

							<fieldset>
								<legend>Text Adjusts</legend>
								<!-- TODO: font size -->
								<!-- TODO: line spacing (height) -->
								<!-- TODO: letter spacing (space btween letters) -->
							</fieldset>

							<fieldset>
								<legend>Motion & Transparency</legend>
								<!-- TODO: reduced motion/animations -->
								<!-- TODO: reduced transparency -->
								<!-- TODO: border styles -->
								<!-- TODO: underline styles -->
								<!-- TODO: border width -->
							</fieldset>

							<fieldset>
								<legend>Themes</legend>

								<div id="theme-list-${this.#id}"></div>
							</fieldset>

							<fieldset>
								<legend>Controller Support</legend>
								<!-- TODO: disable custom controller actions -->
								<!-- TODO: controller mapping -->
							</fieldset>

							<fieldset>
								<legend>Sound</legend>
								<!-- TODO: mute all sounds -->
								<!-- TODO: volume control -->
							</fieldset>

							<fieldset>
								<legend>Debug/Test</legend>

								<input-wrapper>
									<input
										type="checkbox"
										name="css"
										id="css-input-${this.#id}"
									/>
									<label for="css-input-${this.#id}">Disable CSS</label>
									<input-hint>
										<p>This disables the CSS site-wide. All pages will show using the default browser CSS.</p>
									</input-hint>
									<input-hint hidden>
										<p>
											<strong>Note:</strong> This is automatically disabled during <a href="/blog/2025/04/css-naked-day-2025/">CSS Naked Week</a>
										</p>
									</input-hint>
								</input-wrapper>

								<input-wrapper>
									<input
										type="checkbox"
										name="js"
										id="js-input-${this.#id}"
									/>
									<label for="js-input-${this.#id}">Disable JS</label>
									<input-hint>
										<p>This disables the JS site-wide. All pages will continue to work, but some functionality will be disabled.</p>
									</input-hint>
									<input-hint hidden>
										<p>
											<strong>Note:</strong> This is automatically disabled during <a href="/blog/2025/04/css-naked-day-2025/">JS Naked Week</a>
										</p>
									</input-hint>
								</input-wrapper>

								<!-- TODO: trigger iab escape -->
								<!-- TODO: disable logo context menu -->
								<!-- TODO: PWA clean cache -->
								<!-- TODO: PWA trigger install -->
							</fieldset>
						</dialog-content>

						<footer>
							<button
								type="submit"
								popovertarget="site-settings-dialog-${this.#id}"
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
							<use href="#site-settings-icon-warning" width="24" height="24" />
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
			this.querySelector<HTMLDialogElement>(`#site-settings-dialog-${this.#id}`)?.hidePopover();

			const theme = new FormData(evt.target as HTMLFormElement).get('theme') as string;

			SiteSettings.theme = theme;
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('site-switcher')) {
	customElements.define('site-switcher', SiteDisplaySettings);
}
