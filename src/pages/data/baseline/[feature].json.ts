import type { APIRoute } from 'astro';
import type * as BaselineData from 'web-features';
import baselineData from 'web-features/data.json' with { type: 'json' };

const baselineFeatures = (baselineData as typeof BaselineData).features;

export const GET: APIRoute = ({ params }) => {
	const feature = baselineFeatures[params['feature'] ?? ''];

	return new Response(JSON.stringify(feature ?? {}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

export function getStaticPaths() {
	return Object.keys(baselineFeatures).map((feature) => ({ params: { feature } }));
}
