// Ref: https://frontendmasters.com/blog/the-pitfalls-of-in-app-browsers/
import InAppSpy, { SFSVCExperimental } from 'inapp-spy';
import { SiteSettings } from '../settings.ts';

document.addEventListener('DOMContentLoaded', async () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	// eslint-disable-next-line new-cap
	const { isInApp } = InAppSpy();
	// eslint-disable-next-line new-cap
	const isSFSVC = await SFSVCExperimental();

	const url = window.location.href;

	if (isInApp || isSFSVC || SiteSettings.enableIab) {
		let link = `shortcuts://x-callback-url/run-shortcut?name=${crypto.randomUUID()}&x-error=${encodeURIComponent(url)}`;

		if (navigator.userAgent.includes('Android')) {
			link = `intent:${url}#Intent;end`;
		}

		window.location.replace(link);

		const iabAlert = document.querySelector<HTMLDialogElement>('#iab-escape');

		iabAlert?.querySelector('a')?.setAttribute('href', link);
		iabAlert?.showModal();
	}
});
