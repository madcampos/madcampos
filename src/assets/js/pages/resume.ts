const CUTOUT_YEAR = 5;
const cutoutDate = new Date();

cutoutDate.setFullYear(cutoutDate.getFullYear() - CUTOUT_YEAR);

document.querySelectorAll<HTMLTimeElement>('[data-enddate]').forEach((element) => {
	const dateTime = new Date(element.dateTime);

	if (cutoutDate.getFullYear() < dateTime.getFullYear()) {
		return;
	}

	element.toggleAttribute('data-old-entry');
});
