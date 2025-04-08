import { SiteSettings } from '../../assets/js/settings.js';

document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	if (SiteSettings.theme) {
		const themeInput = document.querySelector<HTMLInputElement>(`#theme-switcher input[type="radio"][value="${SiteSettings.theme}"]`);

		if (themeInput) {
			themeInput.checked = true;
		}
	}

	document.querySelector('#theme-switcher form')?.addEventListener('submit', (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		document.querySelector<HTMLDialogElement>('#theme-switcher-dialog')?.hidePopover();

		const theme = new FormData(evt.target as HTMLFormElement).get('theme') as string;

		SiteSettings.theme = theme;
	});
});
