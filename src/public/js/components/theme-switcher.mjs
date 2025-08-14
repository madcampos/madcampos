import { SiteSettings } from '../settings.mjs';

if (!customElements.get('theme-switcher')) {
	customElements.define(
		'theme-switcher',
		class extends HTMLElement {
			constructor() {
				super();

				const supportsDeclarative = Object.hasOwn(HTMLElement.prototype, 'attachInternals');
				const internals = supportsDeclarative ? this.attachInternals() : undefined;
				const shadow = internals?.shadowRoot ?? this.attachShadow({ mode: 'open' });

				shadow.querySelector('form')?.addEventListener('submit', (evt) => {
					evt.preventDefault();
					evt.stopPropagation();
					shadow.querySelector('dialog')?.hidePopover();

					// eslint-disable-next-line @typescript-eslint/prefer-destructuring
					const target = /** @type {HTMLFormElement} */ (evt.target);
					const theme = /** @type {string} */ (new FormData(target).get('theme'));

					SiteSettings.theme = theme;
				});

				if (SiteSettings.theme) {
					const themeInput = /** @type {HTMLInputElement} */ (shadow.querySelector(`input[type="radio"][value="${SiteSettings.theme}"]`));

					if (themeInput) {
						themeInput.checked = true;
					}
				}

				if (SiteSettings.js === 'enabled') {
					shadow.querySelector('aside')?.removeAttribute('hidden');
				}
			}
		}
	);
}
