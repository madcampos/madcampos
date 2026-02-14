/* eslint-disable max-lines */

import {
	type BorderWidthSetting,
	type EnabledDisabledSetting,
	type FontSetting,
	type FontSizeSetting,
	type LetterSpacingSetting,
	type LineHeightSetting,
	type ThemeSetting,
	SiteSettings
} from '../settings.ts';
import type { IabEscape } from './iab-escape.ts';
import type { PWABanner } from './pwa-banner.ts';

interface SiteTheme {
	id: ThemeSetting;
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

interface SiteFontSet {
	id: FontSetting;
	name: string;
	description: string;
}

const fonts: SiteFontSet[] = [
	{
		id: 'default',
		name: 'Theme Default',
		description: 'Uses the default fonts for the selected theme.'
	},
	{
		id: 'browser',
		name: 'Browser Defaults',
		description: "The browser's default fonts."
	},
	{
		id: 'legibility',
		name: 'Increased Legibility',
		description: 'A set of fonts that have increased general legibility.'
	},
	{
		id: 'comic-sans',
		name: 'Comic Sans',
		description: 'The name says it all.'
	}
];

class SiteDisplaySettings extends HTMLElement implements CustomElement {
	#id = Math.trunc(Math.random() * 1000000).toString(16);

	#renderThemes() {
		const themeList = this.querySelector<HTMLElement>('theme-list');

		if (!themeList) {
			return;
		}

		themeList.innerHTML = '';
		themes.forEach((theme) => {
			themeList.insertAdjacentHTML(
				'beforeend',
				`
					<label for="theme-input-${theme.id}-${this.#id}">
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
				`
			);
		});
	}

	#renderFonts() {
		const fontList = this.querySelector<HTMLElement>('font-list');

		if (!fontList) {
			return;
		}

		fontList.innerHTML = '';
		fonts.forEach((font) => {
			fontList.insertAdjacentHTML(
				'beforeend',
				`
					<label for="font-input-${font.id}-${this.#id}">
						<input
							type="radio"
							name="font"
							value="${font.id}"
							id="font-input-${font.id}-${this.#id}"
						/>
						<strong>${font.name}</strong>
						<small><em>${font.description}</em></small>
						<text-swatch aria-hidden="true">
							<figure>
								<article data-font="${font.id}">
									<span>The quick brown fox jumped over the lazy dog.</span>
								</article>
								<figcaption>Body Text font</figcaption>
							</figure>
						</text-swatch>

						<text-swatch aria-hidden="true"">
							<figure>
								<article data-font="${font.id}">
									<span>The quick brown fox jumped over the lazy dog.</span>
								</article>
								<figcaption>Headers font</figcaption>
							</figure>
						</text-swatch>

						<text-swatch aria-hidden="true">
							<figure>
								<article data-font="${font.id}">
									<span>The quick brown fox jumped over the lazy dog.</span>
								</article>
								<figcaption>Code font</figcaption>
							</figure>
						</text-swatch>
					</label>
				`
			);
		});
	}

	#resetSettings() {
		SiteSettings.theme = undefined;
		SiteSettings.font = undefined;
		SiteSettings.fontSize = undefined;
		SiteSettings.lineHeight = undefined;
		SiteSettings.letterSpacing = undefined;
		SiteSettings.isReducedMotion = undefined;
		SiteSettings.hasSolidBorders = undefined;
		SiteSettings.borderWidth = undefined;

		if (SiteSettings.debug) {
			SiteSettings.css = undefined;
			SiteSettings.js = undefined;
			SiteSettings.logoContextMenu = undefined;
			SiteSettings.iabEscape = undefined;
			SiteSettings.pwaBanner = undefined;
		}

		this.#initializeSettings();
	}

	#initializeSettings() {
		this.querySelector<HTMLInputElement>(`theme-list input[type="radio"][value="${SiteSettings.theme}"]`)?.toggleAttribute('checked', true);
		this.querySelector<HTMLInputElement>(`font-list input[type="radio"][value="${SiteSettings.font}"]`)?.toggleAttribute('checked', true);
		this.querySelector<HTMLOptionElement>(`#font-size-input-${this.#id} option[value="${SiteSettings.fontSize}"]`)?.toggleAttribute('selected', true);
		this.querySelector<HTMLOptionElement>(`#line-height-input-${this.#id} option[value="${SiteSettings.lineHeight}"]`)?.toggleAttribute('selected', true);
		this.querySelector<HTMLOptionElement>(`#letter-spacing-input-${this.#id} option[value="${SiteSettings.letterSpacing}"]`)?.toggleAttribute('selected', true);
		this.querySelector<HTMLOptionElement>(`#reduced-motion-input-${this.#id}`)?.toggleAttribute('checked', SiteSettings.isReducedMotion === 'enabled');
		this.querySelector<HTMLOptionElement>(`#solid-borders-input-${this.#id}`)?.toggleAttribute('checked', SiteSettings.hasSolidBorders === 'enabled');
		this.querySelector<HTMLOptionElement>(`#border-width-input-${this.#id} option[value="${SiteSettings.letterSpacing}"]`)?.toggleAttribute('selected', true);

		if (SiteSettings.debug) {
			this.querySelector<HTMLOptionElement>(`#css-input-${this.#id}`)?.toggleAttribute('checked', SiteSettings.css === 'disabled');
			this.querySelector<HTMLOptionElement>(`#js-input-${this.#id}`)?.toggleAttribute('checked', SiteSettings.js === 'disabled');
			this.querySelector<HTMLOptionElement>(`#logo-context-menu-input-${this.#id}`)?.toggleAttribute('checked', SiteSettings.logoContextMenu === 'disabled');
		}
	}

	#updateSettings(form: HTMLFormElement) {
		const formData = new FormData(form);

		SiteSettings.theme = formData.get('theme') as ThemeSetting;
		SiteSettings.font = formData.get('font') as FontSetting;
		SiteSettings.fontSize = formData.get('font-size') as FontSizeSetting;
		SiteSettings.lineHeight = formData.get('line-height') as LineHeightSetting;
		SiteSettings.letterSpacing = formData.get('letter-spacing') as LetterSpacingSetting;
		SiteSettings.isReducedMotion = formData.get('reduced-motion') as EnabledDisabledSetting;
		SiteSettings.hasSolidBorders = formData.get('solid-borders') as EnabledDisabledSetting;
		SiteSettings.borderWidth = formData.get('border-width') as BorderWidthSetting;

		if (SiteSettings.debug) {
			SiteSettings.css = formData.get('css') as EnabledDisabledSetting ?? 'enabled';
			SiteSettings.js = formData.get('js') as EnabledDisabledSetting ?? 'enabled';
			SiteSettings.logoContextMenu = formData.get('logo-context-menu') as EnabledDisabledSetting ?? 'enabled';
		}
	}

	render() {
		this.innerHTML = `
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
						<details name="settings-group" open>
							<summary><h3>Themes</h3></summary>

							<theme-list id="theme-list-${this.#id}"></theme-list>
						</details>

						<details name="settings-group">
							<summary><h3>Fonts</h3></summary>

							<font-list id="font-list-${this.#id}"></font-list>
						</details>

						<details name="settings-group">
							<summary><h3>Text Adjusts</h3></summary>

							<input-wrapper>
								<label for="font-size-input-${this.#id}">Font size adjust</label>
								<select
									name="font-size"
									id="font-size-input-${this.#id}"
								>
									<option value="x-small">Extra Small</option>
									<option value="small">Small</option>
									<option value="medium" selected>Medium</option>
									<option value="large">Large</option>
									<option value="x-large">Extra Large</option>
								</select>
							</input-wrapper>

							<input-wrapper>
								<label for="line-height-input-${this.#id}">Line spacing adjust</label>
								<select
									name="line-height"
									id="line-height-input-${this.#id}"
								>
									<option value="tight">Tight</option>
									<option value="medium" selected>Medium</option>
									<option value="wide">Wide</option>
									<option value="wider">Wider</option>
								</select>
							</input-wrapper>

							<input-wrapper>
								<label for="letter-spacing-input-${this.#id}">Letter spacing adjust</label>
								<select
									name="letter-spacing"
									id="letter-spacing-input-${this.#id}"
								>
									<option value="tighter">Tighter</option>
									<option value="tight">Tight</option>
									<option value="medium" selected>Medium</option>
									<option value="wide">Wide</option>
									<option value="wider">Wider</option>
								</select>
							</input-wrapper>
						</details>

						<details name="settings-group">
							<summary><h3>Borders & Motion</h3></summary>

							<input-wrapper>
								<input
									type="checkbox"
									name="reduced-motion"
									value="enabled"
									id="reduced-motion-input-${this.#id}"
								/>
								<label for="reduced-motion-input-${this.#id}">Disable Animations</label>
							</input-wrapper>

							<input-wrapper>
								<input
									type="checkbox"
									name="solid-borders"
									value="enabled"
									id="solid-borders-input-${this.#id}"
								/>
								<label for="solid-borders-input-${this.#id}">Make underlines and borders solid</label>
							</input-wrapper>

							<input-wrapper>
								<label for="border-width-input-${this.#id}">Border thickness</label>
								<select
									name="border-width"
									id="border-width-input-${this.#id}"
								>
									<option value="none">No Border</option>
									<option value="thin">Thin</option>
									<option value="medium" selected>Medium</option>
									<option value="thick">Thick</option>
									<option value="thicker">Thicker</option>
								</select>
							</input-wrapper>
						</details>

						<details name="settings-group">
							<summary><h3>Controller Support</h3></summary>

							<m-note data-type="alert">
								<p>Under development</p>
							</m-note>

							<!-- TODO: disable custom controller actions -->
							<!-- TODO: controller mapping -->
						</details>

						<details name="settings-group" ${!SiteSettings.debug ? 'hidden' : ''}>
							<summary><h3>Debug/Test</h3></summary>

							<input-wrapper>
								<input-wrapper>
									<input
										type="checkbox"
										name="css"
										id="css-input-${this.#id}"
										value="disabled"
										${!SiteSettings.debug ? 'disabled' : ''}
									/>
									<label for="css-input-${this.#id}">Disable CSS</label>
								</input-wrapper>
							</input-wrapper>

							<input-wrapper>
								<input-wrapper>
									<input
										type="checkbox"
										name="js"
										value="disabled"
										id="js-input-${this.#id}"
										${!SiteSettings.debug ? 'disabled' : ''}
									/>
									<label for="js-input-${this.#id}">Disable JS</label>
								</input-wrapper>
							</input-wrapper>

							<input-wrapper>
								<input-wrapper>
									<input
										type="checkbox"
										name="logo-context-menu"
										value="disabled"
										id="logo-context-menu-input-${this.#id}"
										${!SiteSettings.debug ? 'disabled' : ''}
									/>
									<label for="logo-context-menu-input-${this.#id}">Disable Logo Context Menu</label>
								</input-wrapper>
							</input-wrapper>

							<div>
								<button type="button" id="iab-escape-button-${this.#id}">Trigger IAB Escape</button>
								<button type="button" id="pwa-banner-button-${this.#id}">Trigger PWA Banner</button>
								<button type="button" id="clean-cache-button-${this.#id}">Clean Cache & Reload</button>
							</div>
						</details>
					</dialog-content>

					<footer>
						<button
							type="submit"
							popovertarget="site-settings-dialog-${this.#id}"
							popovertargetaction="hide"
						>Apply settings</button>

						<hr />

						<button type="reset">Reset settings</button>
					</footer>
				</form>
			</dialog>
		`;
	}

	connectedCallback() {
		this.render();

		this.#renderThemes();
		this.#renderFonts();

		this.#initializeSettings();

		this.querySelector('form')?.addEventListener('submit', (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			this.querySelector<HTMLDialogElement>(`#site-settings-dialog-${this.#id}`)?.hidePopover();

			this.#updateSettings(evt.target as HTMLFormElement);
		});

		this.querySelector('form')?.addEventListener('reset', () => this.#resetSettings());

		this.querySelector(`#iab-escape-button-${this.#id}`)?.addEventListener('click', () => {
			this.querySelector<HTMLDialogElement>(`#site-settings-dialog-${this.#id}`)?.hidePopover();
			this.querySelector<IabEscape>('iab-escape')?.open();
		});

		this.querySelector(`#pwa-banner-button-${this.#id}`)?.addEventListener('click', () => {
			this.querySelector<HTMLDialogElement>(`#site-settings-dialog-${this.#id}`)?.hidePopover();
			this.querySelector<PWABanner>('pwa-banner')?.open();
		});

		this.querySelector(`#clear-cache-button-${this.#id}`)?.addEventListener('click', () => {
			this.querySelector<HTMLDialogElement>(`#site-settings-dialog-${this.#id}`)?.hidePopover();
			// TODO: clean cache and reset service worker
			document.location.reload();
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('site-settings')) {
	customElements.define('site-settings', SiteDisplaySettings);
}
