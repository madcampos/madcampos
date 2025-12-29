const CUTOUT_YEAR = 5;
const fiveYearsAgo = new Date();

fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - CUTOUT_YEAR);

document.querySelectorAll<HTMLTimeElement>('[data-enddate]').forEach((element) => {
	const dateTime = new Date(element.dateTime);

	if (fiveYearsAgo.getFullYear() < dateTime.getFullYear()) {
		return;
	}

	element.toggleAttribute('data-old-entry');
});
