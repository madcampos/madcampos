/* eslint-disable @typescript-eslint/only-throw-error, @typescript-eslint/prefer-nullish-coalescing */

import { env } from 'cloudflare:workers';
import { type StatusResponse, DEFAULT_HEADERS, ErrorResponse, generateVisitorId, STATUS_CONFLICT, STATUS_OK } from '../utils/index.ts';

const MIN_HIT_RESULTS = 2;
const TOTAL_HIT_RESULTS = 10;

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

interface HitCountResponse extends CountResult {
	url: string;
	visitTimeAvgInSec: number;
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

export async function getVisitorCount(request: Request<unknown, CfProperties>) {
	try {
		const url = parseUrl(request);

		const { totalVisitors = 0, uniqueVisitors = 0 } = (await env.Database.prepare(`
			SELECT
				COUNT(*) as totalVisitors,
				COUNT(DISTINCT visitor_id) as uniqueVisitors
			FROM hit_counter
			WHERE url = ?
		`).bind(url).first<CountResult>()) ?? {};

		const recentHits = await env.Database.prepare(`
			SELECT timestamp
			FROM hit_counter
			WHERE url = ?
			ORDER BY timestamp DESC
			LIMIT ${TOTAL_HIT_RESULTS}
		`).bind(url).all<Pick<HitRecord, 'timestamp'>>();

		let visitTimeAvgInSec = 0;

		if (recentHits.results && recentHits.results.length >= MIN_HIT_RESULTS) {
			const timestamps = recentHits.results.map((result) => new Date(result.timestamp)).reverse();
			const intervals: number[] = [];

			for (let i = 1; i < timestamps.length; i++) {
				const curTime = timestamps[i]?.getTime() ?? 0;
				const prevTime = timestamps[i - 1]?.getTime() ?? 0;

				intervals.push(curTime - prevTime);
			}

			const avgMs = intervals.reduce((first, last) => first + last, 0) / intervals.length;
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

export async function incrementVisitorCount(request: Request<unknown, CfProperties>) {
	try {
		const url = parseUrl(request);
		const visitorId = await generateVisitorId(request);
		const country = request.cf?.country as string || 'AQ';
		const userAgent = request.headers.get('User-Agent') || 'Unknown/0.0.0';

		const recentVisit = await env.Database.prepare(`
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
			// eslint-disable-next-line no-console
			console.log({ visitorId, recentVisit });
			return new ErrorResponse(`Only one visit allowd every 30 minutes. Last visit: ${recentVisit.timestamp}`, STATUS_CONFLICT);
		}

		const { success, error } = await env.Database.prepare(`
			INSERT INTO hit_counter
				(url, visitor_id, country, user_agent)
			VALUES
				(?, ?, ?, ?)
		`).bind(url, visitorId, country, userAgent).run();

		// eslint-disable-next-line no-console
		console.log({ visitorId });

		return new Response(JSON.stringify({ success, message: error ?? '+1' } satisfies StatusResponse), {
			status: STATUS_OK,
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
