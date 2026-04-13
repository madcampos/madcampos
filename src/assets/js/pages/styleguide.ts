document.addEventListener('DOMContentLoaded', async () => {
	await Promise.allSettled([
		import('../components/baseline.ts'),
		import('../components/codepen.ts'),
		import('../components/content-image.ts'),
		import('../components/inline-share.ts'),
		import('../components/table.ts'),
		import('../components/share-options.ts'),
		import('../components/youtube.ts'),
		import('../components/read-article.ts'),
		import('../components/relative-time.ts')
	]);
});
