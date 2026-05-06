/* eslint-disable */
// @ts-nocheck
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

		const wheel = this.#shadow.querySelector<SVGGElement>('#wheel-group')!;
		const items = this.#shadow.querySelectorAll('slot span');
		const numItems = items.length;
		if (numItems === 0) { return; }

		const segmentAngle = 360 / numItems;
		const randomDeg = Math.trunc(Math.random() * 360) + 1800; // At least 5 full spins
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
			const finalRotation = newEndDeg % 360;
			// The marker is at the top (0 degrees).
			// Rotation is clockwise.
			// The segment at the top is the one that covers the angle range that includes the pointer.
			// Since the wheel rotates clockwise, the angle 0 on the wheel moves to `finalRotation`.
			// So the part of the wheel that is now at 0 was originally at (360 - (finalRotation % 360)) % 360.
			const winningAngle = (360 - (finalRotation % 360)) % 360;
			const winningIndex = Math.floor(winningAngle / segmentAngle);
			const winningItem = items[winningIndex]?.textContent;

			const dialog = this.#shadow.querySelector('dialog');

			if (dialog && winningItem) {
				const title = dialog.querySelector('h2');
				if (title) { title.textContent = `Results: ${winningItem}`; }
				dialog.showModal();
			}
		}, { once: true });

		this.#prevEndDeg = newEndDeg;
	}

	#spinList() {
		const items = this.#shadow.querySelectorAll('slot span');
		if (items.length === 0) { return; }

		const randomItemIndex = Math.trunc(Math.random() * items.length);
		const winningItem = items[randomItemIndex]?.textContent;

		const dialog = this.#shadow.querySelector('dialog');

		if (dialog && winningItem) {
			const title = dialog.querySelector('h2');
			if (title) { title.textContent = `Results: ${winningItem}`; }
			dialog.showModal();
		}
	}

	#updateItems() {
		const slot = this.#shadow.querySelector('slot')!;
		const children = [...slot.assignedElements()].flatMap((c) => c.tagName === 'SPAN' ? [c] : Array.from(c.querySelectorAll('span')));
		const numItems = children.length;
		const wheelGroup = this.#shadow.querySelector('#wheel-group');
		const listContainer = this.#shadow.querySelector('#items-list');

		if (!wheelGroup || !numItems) { return; }

		wheelGroup.innerHTML = '';
		if (listContainer) { listContainer.innerHTML = ''; }

		const angleStep = 360 / numItems;
		const radius = 250;
		const centerX = 250;
		const centerY = 250;

		children.forEach((child, i) => {
			const startAngle = i * angleStep;
			const endAngle = (i + 1) * angleStep;

			// SVG Path for segment
			const x1 = centerX + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
			const y1 = centerY + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
			const x2 = centerX + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
			const y2 = centerY + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

			const largeArcFlag = angleStep > 180 ? 1 : 0;
			const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

			const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.setAttribute('class', 'wheel-segment');

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', pathData);
			path.setAttribute('fill', `hsl(${(i * 360) / numItems}, 70%, 60%)`);
			path.setAttribute('stroke', 'white');
			path.setAttribute('stroke-width', '2');

			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			const textAngle = startAngle + angleStep / 2;
			text.setAttribute('x', (centerX + radius * 0.7 * Math.cos((Math.PI * (textAngle - 90)) / 180)).toString());
			text.setAttribute('y', (centerY + radius * 0.7 * Math.sin((Math.PI * (textAngle - 90)) / 180)).toString());
			text.setAttribute('fill', 'white');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.setAttribute(
				'transform',
				`rotate(${textAngle}, ${centerX + radius * 0.7 * Math.cos((Math.PI * (textAngle - 90)) / 180)}, ${
					centerY + radius * 0.7 * Math.sin((Math.PI * (textAngle - 90)) / 180)
				})`
			);
			text.style.fontSize = '14px';
			text.style.fontWeight = 'bold';
			text.textContent = child.textContent;

			g.append(path, text);
			wheelGroup.append(g);

			// Update list for list view
			if (listContainer) {
				const li = document.createElement('li');
				li.textContent = child.textContent;
				listContainer.append(li);
			}
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
