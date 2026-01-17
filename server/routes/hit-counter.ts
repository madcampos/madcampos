interface HitRecord {
	id: number;
	url: string;
	visitor_id: string;
	timestamp: number;
	country: string;
	user_agent: string;
}

interface CountResult {
	totalVisitors: number;
	uniqueVisitors: number;
}

async function generateVisitorId(request: Request<unknown, CfProperties<unknown>>) {
	const data = JSON.stringify({
		postalCode: request.cf?.postalCode,
		city: request.cf?.city,
		metroCode: request.cf?.metroCode,
		region: request.cf?.region,
		regionCode: request.cf?.regionCode,
		country: request.cf?.country || 'AQ',
		colo: request.cf?.colo,
		continent: request.cf?.continent,
		asn: request.cf?.asn,
		timezone: request.cf?.timezone,
		lattitude: request.cf?.latitude,
		longitude: request.cf?.longitude,
		ipAddress: request.headers.get('CF-Connecting-IP') || '0.0.0.0',
		userAgent: request.headers.get('User-Agent') || 'Unknown/0.0.0'
	});
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

	// @ts-expect-error - Typescript is missing the string conversion method
	return new Uint8Array(hashBuffer).toHex();
}

export async function getVisitorCount(request: Request<unknown, CfProperties<unknown>>, env: Env) {
	const url = new URL(request.url);
	const pathname = url.pathname;

	const { totalVisitors = 0, uniqueVisitors = 0 } = (await env.HitCounterDb.prepare(`
		SELECT
			COUNT(*) as totalVisitors,
			COUNT(DISTINCT visitor_id) as uniqueVisitors
		FROM hit_counter
		WHERE url = ?
	`).bind(pathname).first<CountResult>()) ?? {};

	const recentHits = await env.HitCounterDb.prepare(`
		SELECT timestamp
		FROM hit_counter
		WHERE url = ?
		ORDER BY timestamp DESC
		LIMIT 10
	`).bind(pathname).all<{ timestamp: string }>();

	let averageTimeBetweenVisitsInSeconds = 0;

	if (recentHits.results && recentHits.results.length >= 2) {
		const timestamps = recentHits.results.map((r) => new Date(r.timestamp)).reverse();
		const intervals: number[] = [];

		for (let i = 1; i < timestamps.length; i++) {
			const curTime = timestamps[i]?.getTime() ?? 0;
			const prevTime = timestamps[i - 1]?.getTime() ?? 0;

			intervals.push(curTime - prevTime);
		}

		const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
		averageTimeBetweenVisitsInSeconds = Math.round(avgMs / 1000);
	}

	return new Response(
		JSON.stringify({
			url: pathname,
			totalVisitors,
			uniqueVisitors,
			averageSecondsBetweenVisits: averageTimeBetweenVisitsInSeconds
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
}

export async function incrementVisitorCount(request: Request<unknown, CfProperties<unknown>>, env: Env) {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const visitorId = generateVisitorId(request);
	const country = request.cf?.country as string || 'AQ';
	const userAgent = request.headers.get('User-Agent') || 'Unknown/0.0.0';

	const recentVisit = await env.HitCounterDb.prepare(`
		SELECT id
		FROM hit_counter
		WHERE
			url = ?
			AND visitor_id = ?
			AND timestamp > (datetime('now', '-1 hour', 'utc'))
		ORDER BY timestamp DESC
		LIMIT 1
	`).bind(pathname, visitorId).first<HitRecord>();

	if (recentVisit) {
		// Don't double-count visits within the same hour
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Visit already recorded recently'
			}),
			{
				status: 409,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	const { success, error } = await env.HitCounterDb.prepare(`
		INSERT INTO hit_counter
			(url, visitor_id, country, user_agent)
		VALUES
			(?, ?, ?, ?)
	`).bind(pathname, visitorId, country, userAgent).run();

	return new Response(JSON.stringify({ success, error }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
