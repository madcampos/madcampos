const CUTOUT_YEAR = 7;
const cutoutDate = new Date();

cutoutDate.setFullYear(cutoutDate.getFullYear() - CUTOUT_YEAR);

document.querySelectorAll<HTMLDivElement>('div:not([data-old-entry]):has(time[data-enddate])').forEach((element) => {
	const timeElement = element.querySelector<HTMLTimeElement>('time[data-enddate]');

	if (!timeElement) {
		return;
	}

	const dateTime = new Date(timeElement.dateTime);

	if (cutoutDate.getFullYear() < dateTime.getFullYear()) {
		return;
	}

	element.toggleAttribute('data-old-entry');
});
