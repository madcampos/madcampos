document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	const CSS_NAKED_MONTH = 3;
	const CSS_NAKED_DAY = 7;
	const DAYS_IN_WEEK_COUNT = 6;

	const currentDate = new Date();

	if (currentDate.getMonth() === CSS_NAKED_MONTH) {
		const cssNakedDay = new Date();
		cssNakedDay.setDate(CSS_NAKED_DAY);

		// Slides the week window based on the day of the week that CSS naked day happens.
		const cssNakedWeekBegin = new Date().setDate(cssNakedDay.getDate() - cssNakedDay.getDay());
		const cssNakedWeekEnd = new Date().setDate(cssNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - cssNakedDay.getDay()));

		if (currentDate.getDate() >= cssNakedWeekBegin && currentDate.getDate() <= cssNakedWeekEnd) {
			[...document.querySelectorAll('style, link[rel="stylesheet"]')].forEach((css) => css.remove());
		}
	}
});
