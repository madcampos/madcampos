import { SiteSettings } from '../settings.ts';

class OldStyleButton extends HTMLElement implements CustomElement {
	constructor() {
		super();

		const supportsDeclarative = Object.hasOwn(HTMLElement.prototype, 'attachInternals');
		const internals = supportsDeclarative ? this.attachInternals() : undefined;

		if (!internals?.shadowRoot) {
			this.attachShadow({ mode: 'open' });
		}
	}

	handleEvent(evt: Event) {
		if (evt.type === 'click') {
			const dest = this.getAttribute('dest') ?? '';

			if (dest) {
				window.open(new URL(dest, import.meta.url).toString(), '_blank', 'noopener,noreferrer');
			}
		}
	}

	connectedCallback() {
		this.shadowRoot?.querySelector('button')?.addEventListener('click', this);
	}

	disconnectedCallback() {
		this.shadowRoot?.querySelector('button')?.removeEventListener('click', this);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('old-style-button')) {
	customElements.define('old-style-button', OldStyleButton);
}
