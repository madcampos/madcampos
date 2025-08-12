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

/**
 * @param {string} tagName
 */
function defineElement(tagName) {
	if (!customElements.get(tagName)) {
		customElements.define(tagName, OldStyleButton);
	}
}

defineElement('old-button-ie');
defineElement('old-button-cc');
defineElement('old-button-astro');
defineElement('old-button-feed');
defineElement('old-button-css');
defineElement('old-button-js');
defineElement('old-button-html');
defineElement('old-button-aria');
defineElement('old-button-powered');
defineElement('old-button-writter');
defineElement('old-button-pride');
defineElement('old-button-code');
defineElement('old-button-graphic-design');
defineElement('old-button-guestbook');
