import { SiteSettings } from '../settings.ts';

function html(strings: TemplateStringsArray, ...values: unknown[]) {
	// eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-base-to-string
	return strings.reduce((result, str, i) => result + str + (values[i] ?? ''), '');
}

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

export class BaselineInfo extends HTMLElement implements CustomElement {
	static observedAttributes: ['feature'];

	#id = Math.trunc(Math.random() * 1000000).toString(16);

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
			const level = Number.parseInt(previousHeading.tagName.substring(1));
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			return Math.min(level + 1, 6).toString();
		}

		return '2';
	}

	// eslint-disable-next-line complexity
	async render() {
		if (!this.feature) {
			this.innerHTML = '';
			return;
		}

		const response = await fetch(`/data/baseline/${this.feature}.json`);

		let data: Partial<BaselineFeature> = {};

		if (response.ok) {
			data = await response.json();
		}

		const baselineDate = data?.status?.baseline_high_date ?? data?.status?.baseline_low_date;
		const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
		const formattedBaselineDate = baselineDate ? formatter.format(new Date(baselineDate)) : '&mdash;';

		this.innerHTML = html`
			<baseline-icon>
				<sr-only>Baseline status: ${baselineStatus.get(data?.status?.baseline)}</sr-only>
				<svg viewBox="0 0 36 20" width="36" height="20" aria-hidden="true">
					<use href="/assets/images/components/baseline/baseline-status.svg#baseline-status-${data?.status?.baseline.toString() ?? 'no-data'}" />
				</svg>
			</baseline-icon>

			<hgroup>
				<baseline-heading
					role="heading"
					aria-level="${this.headingLevel}"
					data-baseline="${data?.status?.baseline.toString() ?? 'no-data'}"
				>${data?.name ?? 'Unknown feature'}</baseline-heading>

				<p>
					<span>${baselineStatus.get(data?.status?.baseline)}</span>
					<span>${formattedBaselineDate}</span>
				</p>
			</hgroup>

			<details>
				<summary>Browser support & details</summary>

				<p>
					${data?.description_html ?? data?.description ?? 'No data on this feature'}
				</p>

				<table-wrapper role="region" tabindex="0" aria-labelledby="browser-support-table-${this.#id}">
					<table>
						<caption id="browser-support-table-${this.#id}">Browser Support</caption>
						<thead>
							<tr>
								<th>
									<sr-only>Chrome Desktop</sr-only>
									<baseline-browser-icon>
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-chrome" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Chrome on Android</sr-only>
									<baseline-browser-icon>
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-chrome" />
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-android" transform="translate(0 55) scale(0.5)" transform-origin="bottom right" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Edge Desktop</sr-only>
									<baseline-browser-icon>
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-edge" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Firefox Desktop</sr-only>
									<baseline-browser-icon>
										<svg viewBox="0 0 256 265">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-firefox" />
										</svg>
									</baseline-browser-icon>

								</th>
								<th>
									<sr-only>Firefox on Android</sr-only>
									<baseline-browser-icon>
										<svg viewBox="0 0 256 265">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-firefox" />
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-android" transform="translate(0 60) scale(0.5)" transform-origin="bottom right" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Safari Desktop</sr-only>
									<baseline-browser-icon>
										<svg viewBox="0 0 256 256" width="24" height="24">
											<use href="/assets/images/components/baseline/browser-icons.svg#browser-logo-safari" />
										</svg>
									</baseline-browser-icon>
								</th>
								<th>
									<sr-only>Safari on iOS</sr-only>
									<baseline-browser-icon>
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
								<td>${data?.status?.support.chrome ?? '&mdash;'}</td>
								<td>${data?.status?.support.chrome_android ?? '&mdash;'}</td>
								<td>${data?.status?.support.edge ?? '&mdash;'}</td>
								<td>${data?.status?.support.firefox ?? '&mdash;'}</td>
								<td>${data?.status?.support.firefox_android ?? '&mdash;'}</td>
								<td>${data?.status?.support.safari ?? '&mdash;'}</td>
								<td>${data?.status?.support.safari_ios ?? '&mdash;'}</td>
							</tr>
						</tbody>
					</table>
				</table-wrapper>
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
