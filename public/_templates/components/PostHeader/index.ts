document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	const nativeShareButton = document.querySelector<HTMLButtonElement>('#ps-native');
	const emailShareButton = document.querySelector<HTMLButtonElement>('#ps-email');
	const copyShareButton = document.querySelector<HTMLButtonElement>('#ps-copy');

	if ('share' in navigator) {
		nativeShareButton?.addEventListener('click', () => {
			void navigator.share({
				title: document.title,
				text: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
				url: window.location.href
			});
		});
	} else {
		nativeShareButton?.remove();
	}

	emailShareButton?.addEventListener('click', () => {
		const subject = document.title;
		const body = `Check this blog post: ${window.location.href}`;

		window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	});

	copyShareButton?.addEventListener('click', async () => {
		const url = window.location.href;

		await navigator.clipboard.writeText(url);
	});
});
