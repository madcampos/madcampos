class WheelOffortune extends HTMLElement {
	static observedAttributes = ['display'] as const;
	static DISPLAY_TYPES = ['wheel', 'list'] as const;

	#internals?: ElementInternals;
	#shadow: ShadowRoot;

	constructor() {
		super();

		const supportsDeclarative = Object.hasOwn(HTMLElement.prototype, 'attachInternals');
		this.#internals = supportsDeclarative ? this.attachInternals() : undefined;

		this.#shadow = this.#internals?.shadowRoot ?? this.attachShadow({ mode: 'open' });

		this.#shadow.addEventListener('slotchange', this.#updateItems);

		const displayType = this.display;

		this.display = displayType;
		this.#updateItems();
	}

	get display(): typeof WheelOffortune.DISPLAY_TYPES[number] {
		const display = this.getAttribute('display') as typeof WheelOffortune.DISPLAY_TYPES[number];

		if (WheelOffortune.DISPLAY_TYPES.includes(display)) {
			return display;
		}

		return 'wheel';
	}

	set display(newValue: string | null | undefined) {
		this.setAttribute('display', ['wheel', 'list'].includes(newValue ?? '') ? (newValue as typeof WheelOffortune.DISPLAY_TYPES[number]) : 'wheel');
	}

	#updateItems() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const slot = this.#shadow.querySelector('slot')!;
		const children = [...slot.assignedElements()];

		children.forEach((child) => {
			const listItem = document.createElement('li');

			listItem.append(child);
			this.#shadow.querySelector('#items-list')?.append(listItem);
		});
	}

	attributeChangedCallback(name: typeof WheelOffortune.observedAttributes[number], oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'display':
				this.display = newValue;
				break;
			default:
		}
	}
}

if (!customElements.get('wheel-of-fortune')) {
	customElements.define('wheel-of-fortune', WheelOffortune);
}
