import { SiteSettings } from '../../js/settings.ts';

const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

function getSiteDate(date: Date): string {
	const now = new Date();
	let diffInMs = Math.abs(date.getTime() - now.getTime());

	const units: { label: Intl.RelativeTimeFormatUnit, ms: number }[] = [
		{ label: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
		{ label: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
		{ label: 'day', ms: 1000 * 60 * 60 * 24 }
	];

	const result: string[] = [];

	for (const { label, ms } of units) {
		const value = Math.floor(diffInMs / ms);

		if (value > 0) {
			result.push(new Intl.NumberFormat('en', { style: 'unit', unit: label, unitDisplay: 'long' }).format(value));
			diffInMs -= value * ms;
		}
	}

	if (result.length === 0) {
		return 'now';
	}

	return listFormat.format(result);
}

if (SiteSettings.js !== 'disabled') {
	const siteDate = document.querySelector<HTMLTimeElement>('#site-date');
	const datetime = siteDate?.getAttribute('datetime');

	if (siteDate && datetime) {
		const date = new Date(datetime);
		siteDate.textContent = getSiteDate(date);
	}
}
