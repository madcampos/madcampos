import baselineStyleUrl from '../../css/components/baseline.css?url';
import baselineStatusSvg from '../../images/components/baseline/baseline-status.svg?url';
import browserIconsSvg from '../../images/components/baseline/browser-icons.svg?url';
import browserStatusSvg from '../../images/components/baseline/browser-status.svg?url';
import { SiteSettings } from '../settings.ts';

type BrowserIdentifier = 'chrome_android' | 'chrome' | 'edge' | 'firefox_android' | 'firefox' | 'safari_ios' | 'safari';
type BaselineHighLow = 'high' | 'low';

interface BaselineStatus {
	baseline: BaselineHighLow | false;
	baseline_low_date?: string;
	baseline_high_date?: string;
	support: Partial<Record<BrowserIdentifier, string>>;
}

interface BaselineFeature {
	kind: 'feature';
	name: string;
	description: string;
	description_html: string;
	spec: string[];
	status: BaselineStatus;
}

const baselineStatus = new Map<BaselineHighLow | false | undefined, string>([
	['high', '<strong>Baseline</strong> Widely Available'],
	['low', '<strong>Baseline</strong> Newly Available'],
	[false, 'Limited Availability'],
	[undefined, '<strong>No data on this feature</strong>']
]);

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let baselineData: typeof import('web-features/data.json') | undefined;

export class BaselineInfo extends HTMLElement implements CustomElement {
	static observedAttributes: ['feature'];

	declare shadowRoot: ShadowRoot;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
	}

	get feature(): string {
		return this.getAttribute('feature') ?? '';
	}

	set feature(newValue: string | null | undefined) {
		if (newValue) {
			this.setAttribute('feature', newValue);
		} else {
			this.removeAttribute('feature');
		}

		void this.render();
	}

	// eslint-disable-next-line complexity
	async render() {
		baselineData ??= (await import('web-features/data.json', { with: { type: 'json' } })).default;

		if (!this.feature) {
			this.shadowRoot.innerHTML = '';
			return;
		}

		const data = baselineData.features[this.feature as keyof typeof baselineData['features']] as BaselineFeature | undefined;
		const baselineDate = data?.status?.baseline_high_date ?? data?.status?.baseline_low_date;

		this.shadowRoot.innerHTML = `
			<link rel="stylesheet" href="${baselineStyleUrl}" />
			<details>
				<summary>
					<svg id="marker" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M15.54 11.29L9.88 5.64a1 1 0 0 0-1.42 0a1 1 0 0 0 0 1.41l4.95 5L8.46 17a1 1 0 0 0 0 1.41a1 1 0 0 0 .71.3a1 1 0 0 0 .71-.3l5.66-5.65a1 1 0 0 0 0-1.47"
						/>
					</svg>
					<span id="feature-name">${data?.name ?? 'Unknown feature'}</span>
					<aside>
						<div id="baseline-status" data-baseline="${data?.status.baseline.toString() ?? 'no-data'}">
							<span id="baseline-icon">
								<svg viewBox="0 0 36 20">
									<use href="${baselineStatusSvg}#baseline-status-${data?.status.baseline.toString() ?? 'no-data'}" />
								</svg>
							</span>
							<span>
								<span id="baseline-status-text">
									${baselineStatus.get(data?.status.baseline)}
								</span>
								<span id="baseline-status-date">${baselineDate ? new Date(baselineDate).getFullYear().toString() : '&mdash;'}</span>
							</span>
						</div>
						<div id="browser-support">
							<span class="browser-support" data-status="${data?.status.support.chrome ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 256">
										<use href="${browserIconsSvg}#browser-logo-chrome" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.chrome ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Chrome on Desktop Version: ${data?.status.support.chrome ?? '&mdash;'}</span>
							</span>

							<span class="browser-support" data-status="${data?.status.support.chrome_android ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 256">
										<use href="${browserIconsSvg}#browser-logo-chrome" />
										<use href="${browserIconsSvg}#browser-logo-android" transform="translate(0 55) scale(0.5)" transform-origin="bottom right" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.chrome_android ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Chrome on Android Version: ${data?.status.support.chrome_android ?? '&mdash;'}</span>
							</span>

							<span class="browser-support" data-status="${data?.status.support.edge ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 256">
										<use href="${browserIconsSvg}#browser-logo-edge" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.edge ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Edge Version: ${data?.status.support.edge ?? '&mdash;'}</span>
							</span>

							<span class="browser-support" data-status="${data?.status.support.firefox ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 265">
										<use href="${browserIconsSvg}#browser-logo-firefox" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.firefox ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Firefox Version: ${data?.status.support.firefox ?? '&mdash;'}</span>
							</span>
							<span class="browser-support" data-status="${data?.status.support.firefox_android ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 265">
										<use href="${browserIconsSvg}#browser-logo-firefox" />
										<use href="${browserIconsSvg}#browser-logo-android" transform="translate(0 60) scale(0.5)" transform-origin="bottom right" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.firefox_android ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Firefox on Android Version: ${data?.status.support.firefox_android ?? '&mdash;'}</span>
							</span>
							<span class="browser-support" data-status="${data?.status.support.safari ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 256">
										<use href="${browserIconsSvg}#browser-logo-safari" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.safari ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Safari on Desktop Version: ${data?.status.support.safari ?? '&mdash;'}</span>
							</span>
							<span class="browser-support" data-status="${data?.status.support.safari_ios ? 'supported' : 'unsupported'}">
								<span class="browser-icon">
									<svg viewBox="0 0 256 256">
										<use href="${browserIconsSvg}#browser-logo-safari" />
										<use href="${browserIconsSvg}#browser-logo-ios" transform="translate(0 60) scale(0.5)" transform-origin="bottom right" />
									</svg>
								</span>
								<span class="browser-status">
									<svg viewBox="0 0 24 24">
										<use href="${browserStatusSvg}#browser-status-${data?.status.support.safari_ios ? 'supported' : 'unsupported'}" />
									</svg>
								</span>
								<span class="browser-label">Safari on iOS Version: ${data?.status.support.safari_ios ?? '&mdash;'}</span>
							</span>
						</div>
					</aside>
				</summary>
				<p id="feature-description">
					${data?.description_html ?? data?.description ?? 'No data on this feature'}
				</p>
				<div id="table-wrapper">
					<table>
						<thead>
							<tr>
								<th>Chrome</th>
								<th>Chrome on Android</th>
								<th>Edge</th>
								<th>Firefox</th>
								<th>Firefox on Android</th>
								<th>Safari</th>
								<th>Safari on iOS</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>${data?.status.support.chrome ?? '&mdash;'}</td>
								<td>${data?.status.support.chrome_android ?? '&mdash;'}</td>
								<td>${data?.status.support.edge ?? '&mdash;'}</td>
								<td>${data?.status.support.firefox ?? '&mdash;'}</td>
								<td>${data?.status.support.firefox_android ?? '&mdash;'}</td>
								<td>${data?.status.support.safari ?? '&mdash;'}</td>
								<td>${data?.status.support.safari_ios ?? '&mdash;'}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</details>
		`;
	}

	connectedCallback() {
		void this.render();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'feature':
				this.feature = newValue;
				break;
			default:
		}
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('baseline-info')) {
	customElements.define('baseline-info', BaselineInfo);
}
