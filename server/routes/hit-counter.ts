// oxlint-disable typescript/only-throw-error no-console
import { env } from 'cloudflare:workers';
import { type StatusResponse, DEFAULT_HEADERS, ErrorResponse, generateVisitorId, parseRequestMetadata, STATUS_CONFLICT, STATUS_OK } from '../utils/index.ts';

const MIN_HIT_RESULTS = 2;
const TOTAL_HIT_RESULTS = 10;

interface VisitRecord {
	id: number;
	url: string;
	visitor_id: string;
	timestamp: string;
	country: string;
	user_agent: string;
}

interface HitRecord {
	url: string;
	total_visitors: number;
	unique_visitors: number;
	updated_at: string;
}

interface CountResult {
	totalVisitors: number;
	uniqueVisitors: number;
}

interface HitCountResponse extends CountResult {
	url: string;
	visitTimeAvgInSec: number;
}

function parseUrl(request: Request) {
	const urlPath = new URL(request.url).searchParams.get('url');

	if (!urlPath) {
		throw new ErrorResponse('Missing "url" parameter.');
	}

	const decodedPath = decodeURIComponent(urlPath);
	const normalizedPath = decodedPath.endsWith('/') ? decodedPath : `${decodedPath}/`;

	if (!URL.canParse(normalizedPath, request.url)) {
		throw new ErrorResponse('Invalid "url" parameter');
	}

	const requestUrl = new URL(request.url);
	const parsedUrl = new URL(normalizedPath, requestUrl);

	if (requestUrl.host !== parsedUrl.host && env.NODE_ENV === 'production') {
		throw new ErrorResponse('Invalid host for "url" parameter');
	}

	if (parsedUrl.pathname.startsWith(requestUrl.pathname)) {
		throw new ErrorResponse('Invalid path for "url" parameter');
	}

	return normalizedPath;
}

export async function getVisitorCount(request: Request) {
	try {
		const url = parseUrl(request);

		const recentHits = await env.Database.prepare(/* sql */ `
			SELECT timestamp
			FROM visits
			WHERE url = ?
			ORDER BY timestamp DESC
			LIMIT ${TOTAL_HIT_RESULTS}
		`).bind(url).all<Pick<VisitRecord, 'timestamp'>>();

		let visitTimeAvgInSec = 0;

		// oxlint-disable-next-line typescript/no-unnecessary-condition
		if (recentHits.results && recentHits.results.length >= MIN_HIT_RESULTS) {
			const timestamps = recentHits.results.map((result) => new Date(result.timestamp)).reverse();
			const intervals: number[] = [];

			for (let i = 1; i < timestamps.length; i++) {
				const curTime = timestamps[i]?.getTime() ?? 0;
				const prevTime = timestamps[i - 1]?.getTime() ?? 0;

				intervals.push(curTime - prevTime);
			}

			const avgMs = intervals.reduce((first, last) => first + last, 0) / intervals.length;
			// oxlint-disable-next-line no-magic-numbers
			visitTimeAvgInSec = Math.round(avgMs / 1000);
		}

		const { total_visitors = 0, unique_visitors = 0 } = (await env.Database.prepare(/* sql */ `
			SELECT
				total_visitors,
				unique_visitors
			FROM hit_counter
			WHERE url = ?
		`).bind(url).first<HitRecord>()) ?? {};

		return new Response(
			JSON.stringify(
				{
					url,
					totalVisitors: total_visitors,
					uniqueVisitors: unique_visitors,
					visitTimeAvgInSec
				} satisfies HitCountResponse
			),
			{
				status: STATUS_OK,
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

export async function incrementVisitorCount(request: Request) {
	try {
		const url = parseUrl(request);
		const requestMetadata = parseRequestMetadata(request);
		const visitorId = await generateVisitorId(requestMetadata);

		const recentVisit = await env.Database.prepare(/* sql */ `
			SELECT id, timestamp
			FROM visits
			WHERE
				url = ?
				AND visitor_id = ?
				AND timestamp > (datetime('now', '-30 minutes', 'utc'))
			ORDER BY timestamp DESC
			LIMIT 1
		`).bind(url, visitorId).first<Pick<VisitRecord, 'id' | 'timestamp'>>();

		if (recentVisit) {
			console.error({ visitorId, status: 'multiple hits' });
			return new ErrorResponse(`Only one visit allowed every 30 minutes. Last visit: ${recentVisit.timestamp}`, STATUS_CONFLICT);
		}

		const existingVisitor = await env.Database.prepare(/* sql */ `
			SELECT visitor_id
			FROM visits
			WHERE
				url = ?
				AND visitor_id = ?
			LIMIT 1
		`).bind(url, visitorId).first<{ visitor_id: string }>();

		const results = await env.Database.batch([
			env.Database.prepare(/* sql */ `
				INSERT INTO visits
					(url, visitor_id, country, user_agent)
				VALUES
					(?, ?, ?, ?)
			`).bind(url, visitorId, requestMetadata.country, requestMetadata.userAgent),

			env.Database.prepare(/* sql */ `
				INSERT INTO hit_counter (url, total_visitors, unique_visitors)
				VALUES (?, 1, 1)
				ON CONFLICT(url) DO UPDATE SET
					total_visitors = total_visitors + 1,
					unique_visitors = unique_visitors + ?,
					updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')
			`).bind(url, existingVisitor ? 1 : 0)
		]);

		console.log({ visitorId, status: 'new hit' });

		return new Response(
			JSON.stringify(
				{
					// oxlint-disable-next-line typescript/no-unnecessary-condition
					success: results.every(({ success }) => success),
					message: results.map(({ error }) => error).join(', ') || '+1'
				} satisfies StatusResponse
			),
			{
				status: STATUS_OK,
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
