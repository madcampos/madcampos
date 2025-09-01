import { SiteSettings } from '../settings.mjs';

if (!customElements.get('theme-switcher')) {
	customElements.define(
		'theme-switcher',
		class extends HTMLElement {
			constructor() {
				super();

				this.querySelector('form')?.addEventListener('submit', (evt) => {
					evt.preventDefault();
					evt.stopPropagation();
					this.querySelector('dialog')?.hidePopover();

					// eslint-disable-next-line @typescript-eslint/prefer-destructuring
					const target = /** @type {HTMLFormElement} */ (evt.target);
					const theme = /** @type {string} */ (new FormData(target).get('theme'));

					SiteSettings.theme = theme;
				});

				if (SiteSettings.theme) {
					const themeInput = /** @type {HTMLInputElement} */ (this.querySelector(`input[type="radio"][value="${SiteSettings.theme}"]`));

					if (themeInput) {
						themeInput.checked = true;
					}
				}

				if (SiteSettings.js === 'enabled') {
					this.querySelector('aside')?.removeAttribute('hidden');
				}
			}
		}
	);
}
