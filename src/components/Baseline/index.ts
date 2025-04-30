/* eslint-disable @typescript-eslint/no-non-null-assertion */
import template from './template.html?raw';

type BrowserSupport = 'supported' | 'unsupported';
type BrowserIdentifier = 'chrome_android' | 'chrome' | 'edge' | 'firefox_android' | 'firefox' | 'safari_ios' | 'safari';
type BaselineHighLow = 'high' | 'low';

interface BaselineStatus {
	baseline: BaselineHighLow | false;
	baseline_low_date?: string;
	baseline_high_date?: string;
	support: Partial<Record<BrowserIdentifier, string>>;
}

interface BaselineFeatureData {
	name: string;
	description: string;
	description_html: string;
	status: BaselineStatus;
}

interface BaselineData {
	id: string;
	baselineSupport: string;
	baselineStatus: string;
	baselineDate: string;
	description: string;

	chromeSupport: BrowserSupport;
	chromeVersion: string;

	chromeAndroidSupport: BrowserSupport;
	chromeAndroidVersion: string;

	edgeSupport: BrowserSupport;
	edgeVersion: string;

	firefoxSupport: BrowserSupport;
	firefoxVersion: string;

	firefoxAndroidSupport: BrowserSupport;
	firefoxAndroidVersion: string;

	safariSupport: BrowserSupport;
	safariVersion: string;

	safariIosSupport: BrowserSupport;
	safariIosVersion: string;
}

export function render(id: string, inputData?: BaselineFeatureData) {
	const baselineStatus = new Map<BaselineHighLow | false | undefined, string>([
		['high', '<strong>Baseline</strong> Widely Available'],
		['low', '<strong>Baseline</strong> Newly Available'],
		[false, 'Limited Availability'],
		[undefined, '<strong>No data on this feature</strong>']
	]);

	const baselineDate = inputData?.status?.baseline_high_date ?? inputData?.status?.baseline_low_date;
	const data: BaselineData = {
		id: inputData?.name ?? id,
		baselineStatus: baselineStatus.get(inputData?.status.baseline)!,
		baselineSupport: inputData?.status.baseline?.toString() ?? 'no-data',
		baselineDate: baselineDate ? new Date(baselineDate).getFullYear().toString() : '&mdash;',
		description: inputData?.description_html ?? inputData?.description ?? 'No data on this feature',

		chromeSupport: 'unsupported',
		chromeVersion: '&mdash;',

		chromeAndroidSupport: 'unsupported',
		chromeAndroidVersion: '&mdash;',

		edgeSupport: 'unsupported',
		edgeVersion: '&mdash;',

		firefoxSupport: 'unsupported',
		firefoxVersion: '&mdash;',

		firefoxAndroidSupport: 'unsupported',
		firefoxAndroidVersion: '&mdash;',

		safariSupport: 'unsupported',
		safariVersion: '&mdash;',

		safariIosSupport: 'unsupported',
		safariIosVersion: '&mdash;',

		...Object.fromEntries(
			Object.entries(inputData?.status.support ?? {}).flatMap(([key, value]) => [
				[`${key.replace('_android', 'Android').replace('_ios', 'Ios')}Support`, 'supported'],
				[`${key.replace('_android', 'Android').replace('_ios', 'Ios')}Version`, value]
			])
		)
	};

	return template
		.replaceAll(/\{\{(.+?)\}\}/igu, (_, property: string) => (data[property as keyof BaselineData] ?? '').toString())
		.trim()
		.replaceAll(/\n\t+/giu, ' ');
}
