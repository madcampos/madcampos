import { registerSW } from 'virtual:pwa-register';
import { SiteSettings } from '../../assets/js/settings.ts';

function setPwaMessage(type: 'offline' | 'refresh') {
	const pwaToast = document.querySelector('#pwa-toast') as HTMLDivElement;
	const pwaToastMessage = pwaToast.querySelector('#toast-message') as HTMLDivElement;

	switch (type) {
		case 'refresh':
			pwaToastMessage.innerHTML = 'New content available, click on reload button to update.';
			pwaToast.dataset['refresh'] = 'true';
			break;
		case 'offline':
			pwaToastMessage.innerHTML = 'Site ready to work offline. Navigate to blog pages to save them.';
			pwaToast.dataset['offline'] = 'true';
			break;
		default:
	}
}

window.addEventListener('DOMContentLoaded', () => {
	const refreshSW = registerSW({
		immediate: true,
		onOfflineReady() {
			setPwaMessage('offline');
		},
		onNeedRefresh() {
			setPwaMessage('refresh');
		},
		onRegisteredSW(swScriptUrl) {
			// eslint-disable-next-line no-console
			console.log('SW registered: ', swScriptUrl);
		}
	});

	const pwaEventListener: EventListener = (evt) => {
		const target = evt.target as HTMLElement;

		if (target.matches('#pwa-close')) {
			requestAnimationFrame(() => {
				document.body.removeEventListener('click', pwaEventListener);
				document.querySelector('#pwa-toast')?.remove();

				SiteSettings.pwa = undefined;
			});
		}

		if (target.matches('#pwa-refresh')) {
			SiteSettings.pwa = undefined;

			requestAnimationFrame(async () => refreshSW(true));
		}
	};

	if (SiteSettings.pwa !== 'none') {
		setPwaMessage(SiteSettings.pwa as 'offline' | 'refresh');
	}

	document.body.addEventListener('click', pwaEventListener);
});
