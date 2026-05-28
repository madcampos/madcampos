/* eslint-disable @typescript-eslint/no-magic-numbers */

import { SiteSettings } from '../../assets/js/settings.ts';
import styles from './radar-chart.css?url';

export class RadarChart extends HTMLElement implements CustomElement {
	#items: HTMLElement[] = [];
	#totalItems = 0;
	#maxItems = 0;

	#polarToCartesian(angle: number, value: number) {
		const x = Math.cos(angle - Math.PI / 2) * value;
		const y = Math.sin(angle - Math.PI / 2) * value;

		const epsilon = 1e-10;
		const isTop = y < -epsilon;
		const isBottom = y > epsilon;
		const isLeft = x < -epsilon;
		const isRight = x > epsilon;

		let quadrant: 'bottom-left' | 'bottom-right' | 'bottom' | 'center' | 'left' | 'right' | 'top-left' | 'top-right' | 'top' = 'center';

		if (isTop && isLeft) {
			quadrant = 'top-left';
		} else if (isTop && isRight) {
			quadrant = 'top-right';
		} else if (isBottom && isLeft) {
			quadrant = 'bottom-left';
		} else if (isBottom && isRight) {
			quadrant = 'bottom-right';
		} else if (isTop) {
			quadrant = 'top';
		} else if (isBottom) {
			quadrant = 'bottom';
		} else if (isLeft) {
			quadrant = 'left';
		} else if (isRight) {
			quadrant = 'right';
		}

		return { x, y, quadrant };
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
		const { x, y, quadrant } = this.#polarToCartesian(angle, (clamp * 1000) / 2);

		return /* svg */ `
			<g transform="translate(${x} ${y})" data-quadrant="${quadrant}">
				<circle cx="0" cy="0" r="10" />
				<text>${name}</text>
			</g>
		`;
	}

	render() {
		const itemStyles = this.#items.map((_, i) => /* css */ `
			:scope:has(li:nth-child(${i}):focus-within, li:nth-child(${i}):hover) g.points g:nth-child(${i}) {
				opacity: 1;
				color: var(--accent-color);

				circle { fill: var(--accent-color); }
			}

			:scope:has(g.points g:nth-child(${i}):hover) li:nth-child(${i}) {
				color: var(--accent-color);
				font-weight: bold;
			}
		`).join('\n');

		this.innerHTML = /* html */ `
		<style>
			@scope {
				:scope:has(:where(li:focus-within, li:hover, g.points g:hover)) g.points g {
					opacity: 0.1;
					color: var(--text-2);

					@media (forced-colors: active) { opacity: 0; }
				}

				:scope g.points g:hover {
					opacity: 1;
					color: var(--accent-color);

					circle { fill: var(--accent-color); }
				}

				:scope :is(li:focus-within, li:hover) {
					color: var(--accent-color);
					font-weight: bold;
				}

				${itemStyles}
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
			// eslint-disable-next-line id-length
			const li = this.querySelector(`chart-legend li:nth-child(${i + 1})`);

			li?.append(item);
		});
	}

	connectedCallback() {
		this.#items = Array.from(this.children as HTMLCollectionOf<HTMLElement>);

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
