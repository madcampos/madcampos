import { SiteSettings } from '../../assets/js/settings.ts';
import styles from './radar-chart.css?url';

const sorter = new Intl.Collator('en-CA', { usage: 'sort' });

export class RadarChart extends HTMLElement implements CustomElement {
	#items: HTMLElement[] = [];
	#totalItems = 0;
	#maxItems = 0;

	#polarToCartesian(angle: number, value: number) {
		return {
			x: Math.cos(angle - Math.PI / 2) * value,
			y: Math.sin(angle - Math.PI / 2) * value
		};
	}

	#itemToAxis(index: number) {
		const angle = (Math.PI * 2 * index) / this.#totalItems;
		const { x, y } = this.#polarToCartesian(angle, 500);

		return /* svg */ `<polyline points="0,0 ${x},${y}" />`;
	}

	#itemToPoint(item: HTMLElement, index: number) {
		const name = item.dataset['name'] ?? '';
		const items = Number.parseInt(item.dataset['items'] ?? '0', 10);

		const clamp = Number(items / this.#maxItems);
		const angle = (Math.PI * 2 * index) / this.#totalItems;
		const { x, y } = this.#polarToCartesian(angle, (clamp * 1000) / 2);

		return /* svg */ `
			<g transform="translate(${x} ${y})">
				<circle cx="0" cy="0" r="10" />
				<text y="-20">${name}</text>
			</g>
		`;
	}

	render() {
		this.innerHTML = /* html */ `
		<style>
			@scope {
				:scope:has(li:hover) g.points g { opacity: 0.1; }
				${this.#items.map((_, i) => `:scope:has(li:nth-child(${i}):hover) g.points g:nth-child(${i}) { opacity: 1; }`).join('\n')}
			}
		</style>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1000 1000"
			role="presentation"
		>
			<g class="circles">
				<circle cx="50%" cy="50%" r="1" />
				<circle cx="50%" cy="50%" r="100" />
				<circle cx="50%" cy="50%" r="200" />
				<circle cx="50%" cy="50%" r="300" />
				<circle cx="50%" cy="50%" r="400" />
				<circle cx="50%" cy="50%" r="500" />
			</g>
			<g class="axis" transform="translate(500 500)">
				${this.#items.map((_, i) => this.#itemToAxis(i)).join('\n')}
			</g>
			<g class="points" transform="translate(500 500)">
				${this.#items.map((item, i) => this.#itemToPoint(item, i)).join('\n')}
			</g>
		</svg>
		<chart-legend>
			<hgroup>
				<h2>${this.getAttribute('legend') ?? ''}</h2>
				<p>${this.getAttribute('subtitle') ?? ''}</p>
			</hgroup>
			<ol>
				${this.#items.map(() => `<li></li>`).join('\n')}
			</ol>
		</chart-legend>
		`;

		this.#items.forEach((item, i) => {
			const li = this.querySelector(`chart-legend li:nth-child(${i + 1})`);

			li?.append(item);
		});
	}

	connectedCallback() {
		this.#items = Array.from(this.children as HTMLCollectionOf<HTMLElement>).sort((a, b) => {
			const aName = a.dataset['name'] ?? '';
			const bName = b.dataset['name'] ?? '';

			return sorter.compare(aName, bName);
		});

		this.#totalItems = this.#items.length;
		this.#maxItems = Math.max(...this.#items.map((item) => Number.parseInt(item.dataset['items'] ?? '0', 10)));

		const tagName = 'radar-chart';
		if (!document.head.querySelector(`link[rel="stylesheet"][data-component="${tagName}"]`)) {
			document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" fetchpriority="low" data-component="${tagName}" href="${styles}" />`);
		}

		this.render();
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('radar-chart')) {
	customElements.define('radar-chart', RadarChart);
}
