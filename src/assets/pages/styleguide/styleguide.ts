document.addEventListener('DOMContentLoaded', async () => {
	await Promise.allSettled([
		import('../../../components/Baseline/baseline.ts'),
		import('../../../components/Codepen/codepen.ts'),
		import('../../../components/ImageLightbox/image-lightbox.ts'),
		import('../../../components/InlineShare/inline-share.ts'),
		import('../../../components/TableSorting/table-sorting.ts'),
		import('../../../components/ShareOptions/share-options.ts'),
		import('../../../components/Youtube/youtube.ts'),
		import('../../../components/ReadArticle/read-article.ts'),
		import('../../../components/RelativeTime/relative-time.ts')
	]);
});
