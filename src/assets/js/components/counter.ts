/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { HitCountResponse, StatusResponse } from '../../../../server/routes/hit-counter.ts';
import { SiteSettings } from '../settings.ts';

const HIT_COUNTER_URL = new URL('/api/counter/', SiteSettings.apiUrl).href;

export class HitCounter extends HTMLElement implements CustomElement {
	#MAX_LENGTH = 5;
	#MAX_RETRIES = 3;
	// 1 hour
	#MIN_CHECK_INTERVAL_SEC = 60 * 60;
	// 30 minutes
	#MIN_INCREMENT_TIME_DELTA_SEC = 30 * 60;

	#lastChecked = new Date();
	#visitData: HitCountResponse = {
		url: document.location.pathname,
		totalVisitors: 0,
		uniqueVisitors: 0,
		visitTimeAvgInSec: 0
	};
	#retryCount = 0;
	#updateCallbackRef?: number = undefined;

	async #fetchVisits() {
		if (this.#retryCount <= this.#MAX_RETRIES) {
			try {
				const url = new URL(HIT_COUNTER_URL);

				url.searchParams.set('url', document.location.pathname);

				const response = await fetch(url);
				const json = await response.json<HitCountResponse>();

				return json;
			} catch (err) {
				console.error(err);

				this.#retryCount += 1;
			}
		}

		return this.#visitData;
	}

	async #checkVisitUpdates() {
		const deltaTimeSec = Math.trunc((new Date().getTime() - (this.#lastChecked?.getTime() ?? 0)) / 1000);

		if (deltaTimeSec >= this.#visitData.visitTimeAvgInSec) {
			this.#lastChecked = new Date();
			this.#visitData = await this.#fetchVisits();
			this.render();
		}
	}

	async #fetchNewVisit() {
		try {
			const url = new URL(HIT_COUNTER_URL);

			url.searchParams.set('url', document.location.pathname);

			const response = await fetch(url, { method: 'PUT' });
			const json = await response.json<StatusResponse>();

			if (!response.ok || !json.success) {
				throw new Error(json?.message ?? 'Request failed.');
			}

			localStorage.setItem(`visit-${document.location.pathname}`, new Date().toISOString());
		} catch (err) {
			console.error(err);
		}
	}

	render() {
		const textSpans = [...this.#visitData.totalVisitors.toString().padStart(this.#MAX_LENGTH, '0')]
			.slice(-this.#MAX_LENGTH)
			.map((num) => `<tspan>${num}</tspan>`)
			.join('');

		this.innerHTML = `
			<small>Page Visitors</small>
			<svg viewBox="0 0 100 20" width="100" height="20">
				<text
					x="50%"
					y="60%"
					dominant-baseline="middle"
					text-anchor="middle"
					textLength="80%"
					lengthAdjust="spacingAndGlyphs"
				>${textSpans}</text>
			</svg>
		`;
	}

	async connectedCallback() {
		this.#lastChecked = new Date();
		this.#visitData = await this.#fetchVisits();
		this.render();

		const intervalTimeMs = (
			this.#visitData.visitTimeAvgInSec < this.#MIN_CHECK_INTERVAL_SEC
				? this.#MIN_CHECK_INTERVAL_SEC
				: this.#visitData.visitTimeAvgInSec
		) * 1000;
		// @ts-expect-error
		this.#updateCallbackRef = setInterval(async () => this.#checkVisitUpdates(), intervalTimeMs);

		const savedLastIncrement = localStorage.getItem(`visit-${document.location.pathname}`);
		if (!savedLastIncrement) {
			await this.#fetchNewVisit();
		} else {
			const deltaTimeSec = Math.trunc((new Date().getTime() - new Date(savedLastIncrement).getTime()) / 1000);
			if (deltaTimeSec >= this.#MIN_INCREMENT_TIME_DELTA_SEC) {
				await this.#fetchNewVisit();
			}
		}
	}

	disconnectedCallback() {
		clearInterval(this.#updateCallbackRef);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('hit-counter')) {
	customElements.define('hit-counter', HitCounter);
}
