export default {
	fetch: (request) => new Response(request.url, { headers: { 'Content-Type': 'text/plain' }, status: 200 })
} satisfies ExportedHandler<Env>;
