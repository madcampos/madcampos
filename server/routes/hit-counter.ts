import { env } from 'cloudflare:workers';

const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': env.NODE_ENV === 'production' ? 'https://madcampos.dev' : '*',
	'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Expose-Headers': '*',
	'Access-Control-Max-Age': '86400'
};

interface HitRecord {
	id: number;
	url: string;
	visitor_id: string;
	timestamp: string;
	country: string;
	user_agent: string;
}

interface CountResult {
	totalVisitors: number;
	uniqueVisitors: number;
}

export interface HitCountResponse extends CountResult {
	url: string;
	visitTimeAvgInSec: number;
}

export interface StatusResponse {
	success: boolean;
	message: string;
}

class ErrorResponse extends Response {
	constructor(message: string, status = 400) {
		super(
			JSON.stringify({
				success: false,
				message
			}),
			{
				status,
				headers: {
					...DEFAULT_HEADERS,
					'Content-Type': 'application/json'
				}
			}
		);
	}
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
		userAgent: request.headers.get('User-Agent') || 'Unknown/0.0.0',
		accept: request.headers.get('Accept'),
		acceptLanguage: request.headers.get('Accept-Language'),
		acceptEncoding: request.headers.get('Accept-Encoding')
	});
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

	// @ts-expect-error - Typescript is missing the string conversion method
	return new Uint8Array(hashBuffer).toHex() as string;
}

function parseUrl(request: Request) {
	const url = new URL(request.url).searchParams.get('url');

	if (!url) {
		throw new ErrorResponse('Missing "url" parameter.');
	}

	if (!URL.canParse(url, request.url)) {
		throw new ErrorResponse('Invalid "url" parameter');
	}

	const requestUrl = new URL(request.url);
	const parsedUrl = new URL(url, requestUrl);

	if (requestUrl.host !== parsedUrl.host && env.NODE_ENV === 'production') {
		throw new ErrorResponse('Invalid host for "url" parameter');
	}

	if (parsedUrl.pathname.startsWith(requestUrl.pathname)) {
		throw new ErrorResponse('Invalid path for "url" parameter');
	}

	return url;
}

export function visitorCountOptions() {
	return new Response(null, { status: 200, headers: DEFAULT_HEADERS });
}

export async function getVisitorCount(request: Request<unknown, CfProperties<unknown>>, env: Env) {
	try {
		const url = parseUrl(request);

		const { totalVisitors = 0, uniqueVisitors = 0 } = (await env.HitCounterDb.prepare(`
			SELECT
				COUNT(*) as totalVisitors,
				COUNT(DISTINCT visitor_id) as uniqueVisitors
			FROM hit_counter
			WHERE url = ?
		`).bind(url).first<CountResult>()) ?? {};

		const recentHits = await env.HitCounterDb.prepare(`
			SELECT timestamp
			FROM hit_counter
			WHERE url = ?
			ORDER BY timestamp DESC
			LIMIT 10
		`).bind(url).all<Pick<HitRecord, 'timestamp'>>();

		let visitTimeAvgInSec = 0;

		if (recentHits.results && recentHits.results.length >= 2) {
			const timestamps = recentHits.results.map((r) => new Date(r.timestamp)).reverse();
			const intervals: number[] = [];

			for (let i = 1; i < timestamps.length; i++) {
				const curTime = timestamps[i]?.getTime() ?? 0;
				const prevTime = timestamps[i - 1]?.getTime() ?? 0;

				intervals.push(curTime - prevTime);
			}

			const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
			visitTimeAvgInSec = Math.round(avgMs / 1000);
		}

		return new Response(
			JSON.stringify(
				{
					url,
					totalVisitors,
					uniqueVisitors,
					visitTimeAvgInSec
				} satisfies HitCountResponse
			),
			{
				headers: {
					...DEFAULT_HEADERS,
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (err) {
		if (err instanceof ErrorResponse) {
			return err;
		}

		console.error(err);

		return new ErrorResponse('Failed to process request.');
	}
}

export async function incrementVisitorCount(request: Request<unknown, CfProperties<unknown>>, env: Env) {
	try {
		const url = parseUrl(request);
		const visitorId = await generateVisitorId(request);
		const country = request.cf?.country as string || 'AQ';
		const userAgent = request.headers.get('User-Agent') || 'Unknown/0.0.0';

		const recentVisit = await env.HitCounterDb.prepare(`
			SELECT id, timestamp
			FROM hit_counter
			WHERE
				url = ?
				AND visitor_id = ?
				AND timestamp > (datetime('now', '-30 minutes', 'utc'))
			ORDER BY timestamp DESC
			LIMIT 1
		`).bind(url, visitorId).first<Pick<HitRecord, 'id' | 'timestamp'>>();

		if (recentVisit) {
			return new ErrorResponse(`Only one visit allowd every 30 minutes. Last visit: ${recentVisit.timestamp}`, 409);
		}

		const { success, error } = await env.HitCounterDb.prepare(`
			INSERT INTO hit_counter
				(url, visitor_id, country, user_agent)
			VALUES
				(?, ?, ?, ?)
		`).bind(url, visitorId, country, userAgent).run();

		return new Response(JSON.stringify({ success, error }), {
			status: 200,
			headers: {
				...DEFAULT_HEADERS,
				'Content-Type': 'application/json'
			}
		});
	} catch (err) {
		if (err instanceof ErrorResponse) {
			return err;
		}

		console.error(err);

		return new ErrorResponse('Failed to process request.');
	}
}
