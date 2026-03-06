/* eslint-disable @typescript-eslint/no-magic-numbers */

import { SiteSettings } from '../settings.ts';

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function getRelativeTime(date: Date): string {
	const now = new Date();

	const diffInMs = Math.abs(date.getTime() - now.getTime());
	const diffInSeconds = Math.abs(Math.round(diffInMs / 1000));
	const diffInMinutes = Math.abs(Math.round(diffInMs / (1000 * 60)));
	const diffInHours = Math.abs(Math.round(diffInMs / (1000 * 60 * 60)));
	const diffInDays = Math.abs(Math.round(diffInMs / (1000 * 60 * 60 * 24)));
	const diffInMonths = Math.abs(Math.round(diffInMs / (1000 * 60 * 60 * 24 * 30)));
	const diffInYears = Math.abs(Math.round(diffInMs / (1000 * 60 * 60 * 24 * 365)));

	if (diffInSeconds < 60) {
		return rtf.format(diffInSeconds, 'second');
	} else if (diffInMinutes < 60) {
		return rtf.format(diffInMinutes, 'minute');
	} else if (diffInHours < 24) {
		return rtf.format(diffInHours, 'hour');
	} else if (diffInDays < 30) {
		return rtf.format(diffInDays, 'day');
	} else if (diffInMonths < 12) {
		return rtf.format(diffInMonths, 'month');
	}

	return rtf.format(diffInYears, 'year');
}

if (SiteSettings.js !== 'disabled') {
	document.querySelectorAll('time[data-relative-time]').forEach((element) => {
		const datetime = element.getAttribute('datetime');

		if (datetime) {
			const date = new Date(datetime);
			element.textContent += ` (${getRelativeTime(date)})`;
		}
	});
}
