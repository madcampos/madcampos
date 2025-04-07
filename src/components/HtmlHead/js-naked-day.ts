const JS_NAKED_MONTH = 3;
const JS_NAKED_DAY = 24;
const DAYS_IN_WEEK_COUNT = 6;

const currentDate = new Date();
if (currentDate.getMonth() === JS_NAKED_MONTH) {
	const jsNakedDay = new Date();
	jsNakedDay.setDate(JS_NAKED_DAY);

	// Slides the week window based on the day of the week that js naked day happens.
	const jsNakedWeekBegin = new Date().setDate(jsNakedDay.getDate() - jsNakedDay.getDay());
	const jsNakedWeekEnd = new Date().setDate(jsNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - jsNakedDay.getDay()));

	if (!(currentDate.getDate() >= jsNakedWeekBegin && currentDate.getDate() <= jsNakedWeekEnd)) {
		document.body.classList.add('js-enabled');
	}
}
