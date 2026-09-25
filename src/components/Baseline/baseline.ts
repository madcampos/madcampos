import { loadComponentCss } from '../../assets/js/custom-element.ts';
import { SiteSettings } from '../../assets/js/settings.ts';
import styles from './baseline.css?url';

type BrowserIdentifier = 'chrome_android' | 'chrome' | 'edge' | 'firefox_android' | 'firefox' | 'safari_ios' | 'safari';
type BaselineHighLow = 'high' | 'low';

interface BaselineDiscouraged {
	according_to: [string, ...string[]];
	alternatives?: [string, ...string[]];
	reason: string;
	reason_html: string;
	removal_date?: string;
}

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
	discouraged?: BaselineDiscouraged;
}

const baselineStatus = new Map<BaselineHighLow | false | undefined | 'deprecated' | 'to-be-removed', string>([
	['high', '<strong>Baseline</strong> Widely Available'],
	['low', '<strong>Baseline</strong> Newly Available'],
	[false, 'Limited Availability'],
	['deprecated', '<em>Deprecated</em>'],
	['to-be-removed', '<em>Up for removal</em>'],
	[undefined, '<strong>No data on this feature</strong>']
]);

const MAX_HEADING_LEVEL = 6;

export class BaselineInfo extends HTMLElement implements CustomElement {
	static observedAttributes: ['feature'];

	readonly #id = crypto.randomUUID();

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

	get headingLevel() {
		const headings = Array.from(document.querySelectorAll('rendered-content :is(h1, h2, h3, h4, h5, h6)'));
		const previousHeading = headings.findLast((heading) => this.compareDocumentPosition(heading) === Node.DOCUMENT_POSITION_PRECEDING);

		if (previousHeading) {
			const level = Number.parseInt(previousHeading.tagName.substring(1), 10);
			return Math.min(level + 1, MAX_HEADING_LEVEL).toString();
		}

		return '2';
	}

	#escapeHtmlTags(input: string) {
		return input
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;');
	}

	#resolveStatus(feature: Partial<BaselineFeature>) {
		if (feature.discouraged?.removal_date) {
			return {
				status: 'to-be-removed',
				htmlText: baselineStatus.get('to-be-removed') ?? ''
			};
		} else if (feature.discouraged) {
			return {
				status: 'deprecated',
				htmlText: baselineStatus.get('deprecated') ?? ''
			};
		}

		return {
			status: feature.status?.baseline.toString() ?? 'no-data',
			htmlText: baselineStatus.get(feature.status?.baseline) ?? ''
		};
	}

	#resolveName(feature: Partial<BaselineFeature>) {
		return this.#escapeHtmlTags(feature.name ?? 'Unknown feature');
	}

	#resolveDescription(feature: Partial<BaselineFeature>) {
		return feature.description_html ?? this.#escapeHtmlTags(feature.description ?? 'No data on this feature');
	}

	#resolveDate(feature: Partial<BaselineFeature>) {
		const baselineDate = feature.status?.baseline_high_date ?? feature.status?.baseline_low_date;
		const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
		const formattedDate = baselineDate ? formatter.format(new Date(baselineDate)) : '';

		return formattedDate;
	}

	#resolveBrowserSupport(feature: Partial<BaselineFeature>) {
		return {
			chrome: feature.status?.support.chrome ?? '&mdash;',
			chromeAndroid: feature.status?.support.chrome_android ?? '&mdash;',
			edge: feature.status?.support.edge ?? '&mdash;',
			firefox: feature.status?.support.firefox ?? '&mdash;',
			firefoxAndroid: feature.status?.support.firefox_android ?? '&mdash;',
			safari: feature.status?.support.safari ?? '&mdash;',
			safariIos: feature.status?.support.safari_ios ?? '&mdash;'
		};
	}

	async render() {
		if (!this.feature) {
			this.innerHTML = '';
			return;
		}

		const response = await fetch(`/data/baseline/${this.feature}.json`);

		let feature: Partial<BaselineFeature> = {};

		if (response.ok) {
			feature = await response.json();
		}

		const { status, htmlText: statusText } = this.#resolveStatus(feature);
		const browserSupport = this.#resolveBrowserSupport(feature);

		this.innerHTML = /* html */ `
			<baseline-icon>
				<sr-only>Baseline status: ${statusText}</sr-only>
				<svg viewBox="0 0 540 300" width="36" height="20" aria-hidden="true">
					<use href="/assets/images/components/baseline/baseline-status.svg#baseline-status-${status}" />
				</svg>
			</baseline-icon>

			<hgroup>
				<baseline-heading
					role="heading"
					aria-level="${this.headingLevel}"
					data-baseline="${status}"
				>${this.#resolveName(feature)}</baseline-heading>

				<p>
					<span>${statusText}</span>
					<span>${this.#resolveDate(feature)}</span>
				</p>
			</hgroup>

			<details>
				<summary>Browser support & details</summary>

				<p>
					${this.#resolveDescription(feature)}
				</p>

				<table-wrapper role="region" tabindex="0" aria-labelledby="browser-support-table-${this.#id}">
					<table>
						<caption id="browser-support-table-${this.#id}">Browser Support</caption>
						<thead>
							<tr>
								<th>
									<sr-only>Chrome Desktop</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-chrome" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Chrome on Android</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-chrome" />
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-android" transform="translate(0 55) scale(0.5)" transform-origin="bottom right" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Edge Desktop</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-edge" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Firefox Desktop</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 265">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-firefox" />
										</svg>
									</baseline-browser-icon>

								</th>
								<th>
									<sr-only>Firefox on Android</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 265">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-firefox" />
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-android" transform="translate(0 60) scale(0.5)" transform-origin="bottom right" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Safari Desktop</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-safari" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Safari on iOS</sr-only>
									<baseline-browser-icon aria-hidden="true">
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-safari" />
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-ios" transform="translate(0 60) scale(0.5)" transform-origin="bottom right" />
										</svg>
									</baseline-browser-icon>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>${browserSupport.chrome}</td>
								<td>${browserSupport.chromeAndroid}</td>
								<td>${browserSupport.edge}</td>
								<td>${browserSupport.firefox}</td>
								<td>${browserSupport.firefoxAndroid}</td>
								<td>${browserSupport.safari}</td>
								<td>${browserSupport.safariIos}</td>
							</tr>
						</tbody>
					</table>
				</table-wrapper>
			</details>
		`;
	}

	async connectedCallback() {
		await loadComponentCss('baseline-info', styles);
		await this.render();
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
