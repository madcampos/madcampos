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

		const cssNakedWeekBegin = new Date();
		const cssNakedWeekEnd = new Date();

		// Slides the week window based on the day of the week that CSS naked day happens.
		cssNakedWeekBegin.setDate(cssNakedDay.getDate() - cssNakedDay.getDay());
		cssNakedWeekEnd.setDate(cssNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - cssNakedDay.getDay()));

		if (currentDate.getDate() >= cssNakedWeekBegin.getDate() && currentDate.getDate() <= cssNakedWeekEnd.getDate()) {
			[...document.querySelectorAll('style, link[rel="stylesheet"]')].forEach((css) => css.remove());
		}
	}
});
