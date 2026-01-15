import { SiteSettings } from '../settings.ts';

class OldStyleButton extends HTMLElement {
	constructor() {
		super();

		const supportsDeclarative = Object.hasOwn(HTMLElement.prototype, 'attachInternals');
		const internals = supportsDeclarative ? this.attachInternals() : undefined;
		const shadow = internals?.shadowRoot ?? this.attachShadow({ mode: 'open' });

		shadow.querySelector('button')?.addEventListener('click', () => {
			const dest = this.getAttribute('dest') ?? '';

			if (dest) {
				window.open(new URL(dest, import.meta.url).toString(), '_blank', 'noopener,noreferrer');
			}
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('old-style-button')) {
	customElements.define('old-style-button', OldStyleButton);
}
