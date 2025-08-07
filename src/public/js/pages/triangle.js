document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	document.addEventListener('submit', (evt) => {
		evt.preventDefault();
		evt.stopPropagation();

		alert('ALL YOUR BASE ARE BELONG TO US!!!');
	});
});
