document.addEventListener('DOMContentLoaded', async () => {
	await Promise.allSettled([
		import('../../../components/Baseline/baseline.js'),
		import('../../../components/Codepen/codepen.js'),
		import('../../../components/ImageLightbox/image-lightbox.js'),
		import('../../../components/InlineShare/inline-share.js'),
		import('../../../components/TableSorting/table-sorting.js'),
		import('../../../components/ShareOptions/share-options.js'),
		import('../../../components/Youtube/youtube.js'),
		import('../../../components/RelativeTime/relative-time.js'),
		import('../../../components/ReadArticle/read-article.js')
	]);
});
