export async function loadComponentCss(tagName: string, stylesUrl: string) {
	return new Promise((resolve, reject) => {
		const linkSelector = `link[rel="stylesheet"][data-component="${tagName}"]`;

		if (document.head.querySelector(linkSelector)) {
			resolve(undefined);
			return;
		}

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

		document.head.querySelector(linkSelector)?.addEventListener('load', () => {
			resolve(undefined);
		});

		document.head.querySelector(linkSelector)?.addEventListener('error', () => {
			reject(new Error('Error loading component CSS'));
		});
	});
}
