const searchParams = new URLSearchParams(window.location.search);
const query = searchParams.get('q');
if (query) {
	const pagefindBody = document.querySelector<HTMLElement>('[data-pagefind-body]');

	if (pagefindBody && 'highlights' in CSS) {
		const ranges = [];
		const treeWalker = document.createTreeWalker(pagefindBody, NodeFilter.SHOW_TEXT);
		let currentNode = treeWalker.nextNode();

		while (currentNode) {
			const nodeText = currentNode.textContent?.toLowerCase() ?? '';

			let curTextPosition = 0;

			while (curTextPosition < nodeText.length) {
				const index = nodeText.indexOf(query, curTextPosition);

				// oxlint-disable-next-line max-depth
				if (index === -1) {
					break;
				}

				const range = new Range();

				range.setStart(currentNode, index);
				range.setEnd(currentNode, index + query.length);
				ranges.push(range);

				curTextPosition = index + query.length;
			}

			currentNode = treeWalker.nextNode();
		}

		CSS.highlights.set('search-query', new Highlight(...ranges));
	}
}
