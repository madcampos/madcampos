/* eslint-disable */
// @ts-nocheck
// TODO: reimplement wheel of fortune
// Ref: https://stackoverflow.com/questions/33850201/how-to-draw-a-wheel-of-fortune
class WheelOffortune extends HTMLElement {
	static observedAttributes = ['display'];
	static DISPLAY_TYPES = ['wheel', 'list'] as const;

	#internals?: ElementInternals;
	#shadow: ShadowRoot;

	#animation?: Animation;
	#prevEndDeg = 0;

	constructor() {
		super();

		const supportsDeclarative = Object.hasOwn(HTMLElement.prototype, 'attachInternals');
		this.#internals = supportsDeclarative ? this.attachInternals() : undefined;

		this.#shadow = this.#internals?.shadowRoot ?? this.attachShadow({ mode: 'open' });

		this.#shadow.addEventListener('slotchange', () => this.#updateItems());

		const displayType = this.display;

		this.display = displayType;
		this.#updateItems();

		this.#shadow.querySelector('#wheel-spin')?.addEventListener('click', () => this.#spinWheel());

		this.#shadow.querySelector('#list-spin')?.addEventListener('click', () => this.#spinList());

		this.#shadow.querySelector('#show-list')?.addEventListener('click', () => {
			this.display = 'list';
		});

		this.#shadow.querySelector('#show-wheel')?.addEventListener('click', () => {
			this.display = 'wheel';
		});
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

	#spinWheel() {
		if (this.#animation) {
			this.#animation.cancel();
		}

		// TODO: figure out math to stop on a specific section

		const wheel = this.#shadow.querySelector<HTMLOListElement>('#items-list')!;

		const randomDeg = Math.trunc(Math.random() * 1000) + 1800;
		const newEndDeg = this.#prevEndDeg + randomDeg;

		this.#animation = wheel.animate([
			{ transform: `rotate(${this.#prevEndDeg}deg)` },
			{ transform: `rotate(${newEndDeg}deg)` }
		], {
			duration: 4000,
			direction: 'normal',
			easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)',
			fill: 'forwards',
			iterations: 1
		});

		this.#animation.addEventListener('finish', () => {
			// this.#shadow.querySelector('dialog')?.showModal();
		}, { once: true });

		this.#prevEndDeg = newEndDeg;
	}

	#spinList() {
		const wheel = this.#shadow.querySelector<HTMLOListElement>('#items-list')!;
		const sections = wheel.querySelectorAll('li').length;
		const randomItem = Math.trunc(Math.random() * sections);

		// TODO: highlight section and add aria-selected
		console.log(randomItem);
	}

	#updateItems() {
		const slot = this.#shadow.querySelector('slot')!;
		const children = [...slot.assignedElements()];

		children.forEach((child) => {
			const listItem = document.createElement('li');
			const wrapper = document.createElement('span');

			wrapper.classList.add('item-wrapper');

			wrapper.append(child);
			listItem.append(wrapper);
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
