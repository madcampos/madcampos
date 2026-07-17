// oxlint-disable-next-line no-magic-numbers
const LOADING_TIMEOUT = 5 * 1000;

export async function loadComponentCss(tagName: string, stylesUrl: string) {
	const linkPromise = new Promise((resolve, reject) => {
		const linkSelector = `link[rel="stylesheet"][data-component="${tagName}"]`;
		let existingLink = document.head.querySelector<HTMLLinkElement>(linkSelector);

		if (!existingLink) {
			document.head.insertAdjacentHTML(
				'beforeend',
				/* html */ `
				<link
					rel="stylesheet"
					fetchpriority="low"
					data-component="${tagName}"
					href="${stylesUrl}"
				/>
			`
			);

			existingLink = document.head.querySelector<HTMLLinkElement>(linkSelector);
		}

		existingLink?.addEventListener('load', () => {
			resolve(undefined);
		});

		existingLink?.addEventListener('error', () => {
			reject(new Error('Error loading component CSS'));
		});
	});

	const timeoutPromise = new Promise((resolve) => {
		setTimeout(() => {
			resolve(undefined);
		}, LOADING_TIMEOUT);
	});

	return Promise.race([
		linkPromise,
		timeoutPromise
	]);
}
