class ElementStripper {
	element(element: Element) {
		if (!element.removed) {
			element.removeAndKeepContent();
		}
	}

	comments(comment: Comment) {
		if (!comment.removed) {
			comment.remove();
		}
	}
}

export async function cleanHTMLString(htmlString: string) {
	const rewriter = new HTMLRewriter();

	rewriter.on('*', new ElementStripper());
	const result = rewriter.transform(new Response(htmlString));

	return result.text();
}
