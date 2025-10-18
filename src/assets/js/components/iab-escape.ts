// Ref: https://frontendmasters.com/blog/the-pitfalls-of-in-app-browsers/
import InAppSpy, { SFSVCExperimental } from 'inapp-spy';
import { SiteSettings } from '../settings.ts';

class IabExcape extends HTMLElement implements CustomElement {
	constructor() {
		super();

		this.innerHTML = `
			<dialog tabindex="0">
				<h2>It's a trap!</h2>
				<div>
					<p>You are locked inside an In-App Browser.</p>
					<p>
						Those are made to lock you inside a platform and control all your data.
						<br />
						They may promise you privacy, but dont'respect that.
					</p>
					<p>Tap the link below to open this page in your default browser.</p>
				</div>
				<a href="#" target="_blank">Escape this trap</a>
			</dialog>
		`;
	}

	async connectedCallback() {
		// eslint-disable-next-line new-cap
		const { isInApp } = InAppSpy();
		// eslint-disable-next-line new-cap
		const isSFSVC = await SFSVCExperimental();

		const url = window.location.href;

		if (isInApp || isSFSVC || SiteSettings.iabEscape) {
			let link = `shortcuts://x-callback-url/run-shortcut?name=${crypto.randomUUID()}&x-error=${encodeURIComponent(url)}`;

			if (navigator.userAgent.includes('Android')) {
				link = `intent:${url}#Intent;end`;
			}

			this.querySelector<HTMLDialogElement>('a')?.setAttribute('href', link);
			this.querySelector<HTMLDialogElement>('dialog')?.showModal();
		}
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('iab-escape')) {
	customElements.define('iab-escape', IabExcape);
}
