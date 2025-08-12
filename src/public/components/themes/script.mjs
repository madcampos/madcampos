import { SiteSettings } from '../../js/settings.mjs';

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

if (!customElements.get('custom-theme')) {
	customElements.define(
		'custom-theme',
		class extends HTMLElement {
			static formAssociated = true;

			constructor() {
				super();

				const supportsDeclarative = Object.hasOwn(HTMLElement.prototype, 'attachInternals');
				this.internals = supportsDeclarative ? this.attachInternals() : undefined;
				this.shadow = this.internals?.shadowRoot ?? this.attachShadow({ mode: 'open' });
			}

			get value() {
				return this.id;
			}

			set value(newValue) {
				this.id = newValue;
			}

			get form() {
				return this.internals?.form;
			}

			name = 'theme';

			get type() {
				return this.localName;
			}
			get validity() {
				return this.internals?.validity;
			}
			get validationMessage() {
				return this.internals?.validationMessage;
			}
			get willValidate() {
				return this.internals?.willValidate;
			}

			checkValidity() {
				return this.internals?.checkValidity();
			}
			reportValidity() {
				return this.internals?.reportValidity();
			}
		}
	);
}
