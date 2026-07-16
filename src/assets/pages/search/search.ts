import type { PagefindInstance } from './pagefind';

const pageFindUrl = import.meta.env.DEV ? '../../../../dist/pagefind/pagefind.js' : '/pagefind/pagefind.js';
const pagefind: PagefindInstance = await import(/* @vite-ignore */ pageFindUrl);

await pagefind.options({
	highlightParam: 'q',
	ranking: {
		diacriticSimilarity: 0.8,
		termFrequency: 0.7,
		termSimilarity: 1.2,
		pageLength: 0.5,
		termSaturation: 1.6,
		metaWeights: {
			image: 0.5,
			image_alt: 0.5
		}
	}
});

await pagefind.init();

// TODO: handle query string on load

document.querySelector('form')?.addEventListener('submit', async (evt) => {
	evt.preventDefault();

	if (!(evt.target instanceof HTMLFormElement)) {
		return;
	}

	if (evt.target.ariaDisabled === 'true') {
		return;
	}

	const formData = new FormData(evt.target);
	// oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion
	const query = formData.get('q') as string;

	// oxlint-disable-next-line typescript/no-non-null-assertion
	const searchResults = document.querySelector('search-results')!;

	searchResults.innerHTML = '<progress></progress>';
	evt.target.ariaDisabled = 'true';

	const { results } = await pagefind.search(query);

	const data = await Promise.all(results.map(async ({ data: dataCb }) => dataCb()));

	searchResults.innerHTML = '';
	for (const { meta, excerpt, url } of data) {
		searchResults.insertAdjacentHTML(
			'beforeend',
			/* html */ `
			<m-card>
				<article itemscope itemtype="">
						<picture itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
							<img
								itemprop="contentUrl"
								src="${meta['image']}"
								alt="${meta['image_alt']}"
								loading="lazy"
							/>
						</picture>

						<header>
							<card-title>
								<a href="${url}">
									<h2>${meta['title']}</h2>
								</a>
							</card-title>
						</header>

						<rendered-content itemprop="description">
							<blockquote>${excerpt}</blockquote>
						</rendered-content>
					</article>
			</m-card>
		`
		);
	}

	evt.target.ariaDisabled = 'false';
});

document.querySelector('search')?.removeAttribute('hidden');
