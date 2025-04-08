import { SiteSettings } from '../../assets/js/settings.ts';

document.addEventListener('DOMContentLoaded', () => {
	if (SiteSettings.enableJs) {
		return;
	}

	const JS_NAKED_MONTH = 3;
	const JS_NAKED_DAY = 24;
	const DAYS_IN_WEEK_COUNT = 6;

	const currentDate = new Date();
	if (currentDate.getMonth() === JS_NAKED_MONTH) {
		const jsNakedDay = new Date();
		jsNakedDay.setDate(JS_NAKED_DAY);

		const jsNakedWeekBegin = new Date();
		const jsNakedWeekEnd = new Date();

		// Slides the week window based on the day of the week that js naked day happens.
		jsNakedWeekBegin.setDate(jsNakedDay.getDate() - jsNakedDay.getDay());
		jsNakedWeekEnd.setDate(jsNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - jsNakedDay.getDay()));

		if (!(currentDate.getDate() >= jsNakedWeekBegin.getDate() && currentDate.getDate() <= jsNakedWeekEnd.getDate())) {
			document.body.classList.add('js-enabled');
		}
	}
});
