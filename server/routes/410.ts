export function nonExistentPages() {
	return new Response('Page does not exist', { status: 410, statusText: 'page' });
}
