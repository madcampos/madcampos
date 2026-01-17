import { SiteSettings } from '../settings.ts';

const HIT_COUNTER_URL = new URL('/api/counter/', SiteSettings.apiUrl).href;

export class HitCounter extends HTMLElement implements CustomElement {
	async render() {
		const url = new URL(HIT_COUNTER_URL);

		url.searchParams.set('url', document.location.href);

		const response = await fetch(url);
		const json = await response.json();

		debugger;

		this.innerHTML = `
			<svg viewBox="0 0 100 20" width="100" height="20">
				<text><tspan>0</tspan></text>
			</svg>
		`;
	}

	connectedCallback() {
		void this.render();
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('hit-counter')) {
	customElements.define('hit-counter', HitCounter);
}
