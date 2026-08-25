// oxlint-disable no-magic-numbers
import styles from './counter.css?url';

interface HitCountResponse {
	totalVisitors: number;
	uniqueVisitors: number;
	url: string;
	visitTimeAvgInSec: number;
}

interface StatusResponse {
	success: boolean;
	message: string;
}

import { loadComponentCss } from '../../assets/js/custom-element.ts';
import { SiteSettings } from '../../assets/js/settings.ts';

const HIT_COUNTER_URL = new URL('/api/counter/', SiteSettings.apiUrl).href;

export class HitCounter extends HTMLElement implements CustomElement {
	readonly #MAX_LENGTH = 5;
	readonly #MAX_RETRIES = 3;
	// 1 hour
	readonly #MIN_CHECK_INTERVAL_SEC = 60 * 60;
	// 30 minutes
	readonly #MIN_INCREMENT_TIME_DELTA_SEC = 1;

	#lastChecked = new Date('0000-01-01T00:00:00Z');
	#visitData: HitCountResponse = {
		url: document.location.pathname,
		totalVisitors: 0,
		uniqueVisitors: 0,
		visitTimeAvgInSec: 0
	};
	#retryCount = 0;
	#updateCallbackRef?: NodeJS.Timeout | number = undefined;

	async #fetchVisits() {
		this.#lastChecked = new Date();

		if (this.#retryCount <= this.#MAX_RETRIES) {
			try {
				const url = new URL(HIT_COUNTER_URL);

				url.searchParams.set('url', document.location.pathname);

				const response = await fetch(url);
				const json: HitCountResponse = await response.json();

				this.#visitData = json;
				this.#retryCount = 0;
			} catch (err) {
				console.error(err);

				this.#retryCount += 1;
			}
		}
	}

	async #checkVisitUpdates() {
		const deltaTimeSec = Math.trunc((new Date().getTime() - this.#lastChecked.getTime()) / 1000);
		if (deltaTimeSec >= this.#visitData.visitTimeAvgInSec) {
			await this.#fetchVisits();
			this.render();
		}

		const intervalTimeMs = (
			this.#visitData.visitTimeAvgInSec < this.#MIN_CHECK_INTERVAL_SEC
				? this.#MIN_CHECK_INTERVAL_SEC
				: this.#visitData.visitTimeAvgInSec
		) * 1000;

		clearTimeout(this.#updateCallbackRef);
		this.#updateCallbackRef = setTimeout(async () => this.#checkVisitUpdates(), intervalTimeMs);
	}

	async #fetchNewVisit() {
		const savedLastIncrement = localStorage.getItem(`visit-${document.location.pathname}`) ?? '0000-01-01T00:00:00Z';
		const deltaTimeSec = Math.trunc((new Date().getTime() - new Date(savedLastIncrement).getTime()) / 1000);
		if (deltaTimeSec < this.#MIN_INCREMENT_TIME_DELTA_SEC) {
			return;
		}

		try {
			const url = new URL(HIT_COUNTER_URL);

			url.searchParams.set('url', document.location.pathname);

			const response = await fetch(url, { method: 'PUT' });
			const json: StatusResponse = await response.json();

			if (!response.ok || !json.success) {
				// oxlint-disable-next-line typescript/no-unnecessary-condition
				throw new Error(json?.message ?? 'Request failed.');
			}

			localStorage.setItem(`visit-${document.location.pathname}`, new Date().toISOString());

			await this.#fetchVisits();
		} catch (err) {
			console.error(err);
		}
	}

	render() {
		// oxlint-disable-next-line typescript/no-misused-spread
		const textSpans = [...this.#visitData.totalVisitors.toString().padStart(this.#MAX_LENGTH, '0')]
			.slice(-this.#MAX_LENGTH)
			.map((num) => `<tspan>${num}</tspan>`)
			.join('');

		this.innerHTML = `
			<small>Page Visitors</small>
			<svg viewBox="0 0 100 20" width="100" height="20" role="none">
				<text
					x="50%"
					y="60%"
					dominant-baseline="middle"
					text-anchor="middle"
					textLength="80%"
					lengthAdjust="spacingAndGlyphs"
					font-variant="tabular-nums"
				>${textSpans}</text>
			</svg>
		`;
	}

	async connectedCallback() {
		await loadComponentCss('hit-counter', styles);

		this.render();

		await this.#fetchNewVisit();
		await this.#checkVisitUpdates();
		this.render();
	}

	disconnectedCallback() {
		clearTimeout(this.#updateCallbackRef);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('hit-counter')) {
	customElements.define('hit-counter', HitCounter);
}
