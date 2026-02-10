/* eslint-disable @typescript-eslint/only-throw-error */
import { env } from 'cloudflare:workers';
import {
	type PaginatedResponse,
	type StatusResponse,
	DEFAULT_HEADERS,
	ErrorResponse,
	generateVisitorId,
	parseRequestMetadata,
	STATUS_CONFLICT,
	STATUS_OK
} from '../utils/index.ts';
import { TurnstileValidator } from '../utils/turnstile.ts';

const MAX_NAME_LENGTH = 128;
const MAX_MESSAGE_LENGTH = 512;
const POST_TIME_THRESHOLD = '-7 days';
const MESSAGES_PER_PAGE = 20;

interface MessageRecord {
	id: number;
	name: string;
	message: string;
	visitor_id: string;
	timestamp: string;
	country: string;
	user_agent: string;
}

function parsePaginationData(request: Request<unknown, CfProperties>) {
	const url = new URL(request.url);
	const [page] = url.pathname.replace(/\/$/iu, '').replace(/^\//iu, '').split('/').reverse();

	if (!page) {
		return 1;
	}

	const pageNumber = Number.parseInt(page);
	if (Number.isNaN(pageNumber)) {
		return 1;
	}

	return pageNumber;
}

export async function getMessages(request: Request<unknown, CfProperties>) {
	try {
		let pageNumber = parsePaginationData(request);

		const { count: totalMessages } = await env.Database.prepare(`
			SELECT COUNT(*) as count
			FROM guestbook
		`).first<{ count: number }>() ?? { count: 0 };
		const lastPage = Math.ceil(totalMessages / MESSAGES_PER_PAGE);

		if (pageNumber > lastPage) {
			pageNumber = lastPage;
		}

		const offset = MESSAGES_PER_PAGE * pageNumber;
		const { results, success, error } = await env.Database.prepare(`
			SELECT name, message, timestamp
			FROM guestbook
			ORDER BY timestamp DESC
			OFFSET ?
			LIMIT ${MESSAGES_PER_PAGE}
		`).bind(offset).run<Pick<MessageRecord, 'message' | 'name' | 'timestamp'>>();

		if (!success) {
			throw new Error(error ?? 'DB Error');
		}
		const parsedUrl = new URL(request.url);

		return {
			start: offset,
			end: results.length + offset,
			total: totalMessages,
			currentPage: pageNumber,
			size: MESSAGES_PER_PAGE,
			lastPage,
			data: results,
			url: {
				current: parsedUrl.href,
				first: new URL('/api/guestbook/', parsedUrl).href,
				last: new URL(`/api/guestbook/${Math.ceil(totalMessages / MESSAGES_PER_PAGE)}`, parsedUrl).href,
				prev: pageNumber > 1 ? new URL(`/api/guestbook${pageNumber - 1 === 1 ? '/' : `/${pageNumber - 1}/`}`, parsedUrl).href : undefined,
				next: pageNumber < lastPage ? new URL(`/api/guestbook/${pageNumber + 1}`, parsedUrl).href : undefined
			}
		} satisfies PaginatedResponse<Pick<MessageRecord, 'message' | 'name' | 'timestamp'>>;
	} catch (err) {
		console.error(err);

		return new ErrorResponse('Failed to process request.');
	}
}

async function parseMessageRequestData(request: Request<unknown, CfProperties>) {
	const body = await request.formData();
	const data = {
		name: body.get('name'),
		message: body.get('message'),
		token: body.get('token')
	};

	if (typeof data.token !== 'string' || !data.token) {
		throw new ErrorResponse('Invalid "token".');
	}

	if (typeof data.name !== 'string' || !data.name || data.name.length > MAX_NAME_LENGTH) {
		throw new ErrorResponse('Invalid "name".');
	}

	// Name has "URL like" parts
	if (data.name.includes('://')) {
		throw new ErrorResponse('Invalid "message".');
	}

	// Name has "domain like" parts, maybe be a url or an email
	if (/[a-z]\.[a-z]{2,}/iu.test(data.name)) {
		throw new ErrorResponse('Invalid "message".');
	}

	if (typeof data.message !== 'string' || !data.message || data.message.length > MAX_MESSAGE_LENGTH) {
		throw new ErrorResponse('Invalid "message".');
	}

	// Message has "URL like" parts
	if (data.message.includes('://')) {
		throw new ErrorResponse('Invalid "message".');
	}

	// Message has "domain like" parts, maybe be a url or an email
	if (/[a-z]\.[a-z]{2,}/iu.test(data.message)) {
		throw new ErrorResponse('Invalid "message".');
	}

	return data as { name: string, message: string, token: string };
}

export async function sendMessage(request: Request<unknown, CfProperties>) {
	try {
		const requestMetadata = parseRequestMetadata(request);
		const data = await parseMessageRequestData(request);

		const { success: isValidationSuccessful } = await TurnstileValidator.validate(data.token, requestMetadata.ipAddress);

		if (!isValidationSuccessful) {
			throw new ErrorResponse('Captcha validation vailed');
		}

		const visitorId = await generateVisitorId(requestMetadata);

		const recentPost = await env.Database.prepare(`
			SELECT id, timestamp
			FROM guestbook
			WHERE
				visitor_id = ?
				AND timestamp > (datetime('now', '${POST_TIME_THRESHOLD}', 'utc'))
			ORDER BY timestamp DESC
			LIMIT 1
		`).bind(visitorId).first<Pick<MessageRecord, 'id' | 'timestamp'>>();

		if (recentPost) {
			// eslint-disable-next-line no-console
			console.log({ visitorId, recentPost });
			throw new ErrorResponse(`Only one post allowed per week. Last post: ${recentPost.timestamp}`, STATUS_CONFLICT);
		}

		const { success, error } = await env.Database.prepare(`
			INSERT INTO guestbook
				(
					name, message,
					visitor_id,
					country, user_agent, ip_address
				)
			VALUES
				(
					?, ?,
					?,
					?, ? , ?
				)
		`).bind(
			data.name,
			data.message,
			visitorId,
			requestMetadata.country,
			requestMetadata.userAgent,
			requestMetadata.ipAddress
		).run();

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
