import { SiteSettings } from '../../assets/js/settings.ts';

document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	if (SiteSettings.css === 'enabled') {
		return;
	}

	let shouldRemoveCSS = false;

	const CSS_NAKED_MONTH = 3;
	const CSS_NAKED_DAY = 9;
	const DAYS_IN_WEEK_COUNT = 6;

	const currentDate = new Date();

	if (currentDate.getMonth() === CSS_NAKED_MONTH) {
		const cssNakedDay = new Date();
		cssNakedDay.setDate(CSS_NAKED_DAY);

		const cssNakedWeekBegin = new Date();
		const cssNakedWeekEnd = new Date();

		// Slides the week window based on the day of the week that CSS naked day happens.
		cssNakedWeekBegin.setDate(cssNakedDay.getDate() - cssNakedDay.getDay());
		cssNakedWeekEnd.setDate(cssNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - cssNakedDay.getDay()));

		if ((currentDate.getDate() >= cssNakedWeekBegin.getDate() && currentDate.getDate() <= cssNakedWeekEnd.getDate())) {
			shouldRemoveCSS = true;
		}
	}

	if (SiteSettings.css === 'disabled') {
		shouldRemoveCSS = true;
	}

	if (shouldRemoveCSS) {
		[...document.querySelectorAll('style, link[rel~="stylesheet"]')].forEach((css) => css.remove());

		[...document.querySelectorAll('[style]')].forEach((element) => element.removeAttribute('style'));
	}
});
