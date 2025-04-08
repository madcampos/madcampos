// Ref: https://frontendmasters.com/blog/the-pitfalls-of-in-app-browsers/
import InAppSpy from 'inapp-spy';

document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	// eslint-disable-next-line new-cap
	const { isInApp } = InAppSpy();

	const url = `https://madcampos.dev`;
	const intentLink = `intent:${url}#Intent;end`;
	const shortcutsLink = `shortcuts://x-callback-url/run-shortcut?name=${crypto.randomUUID()}&x-error=${encodeURIComponent(url)}`;

	if (isInApp) {
		let link = shortcutsLink;

		if (navigator.userAgent.includes('Android')) {
			link = intentLink;
		}

		window.location.replace(link);

		const iabAlert = document.createElement('dialog');
		iabAlert.innerHTML = `
		<p>Tap the link to open in your default browser</p>
		<a href="${link}" target="_blank">Open</a>
	`;
		document.body.insertAdjacentElement('afterbegin', iabAlert);

		iabAlert.showModal();
	}
});
