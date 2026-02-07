/* eslint-disable @typescript-eslint/only-throw-error */
import { env } from 'cloudflare:workers';
import { ErrorResponse, generateVisitorId } from '../utils/index.ts';

const MAX_NAME_LENGTH = 128;
const MAX_MESSAGE_LENGTH = 512;

interface MessageRecord {
	id: number;
	name: string;
	message: string;
	visitor_id: string;
	timestamp: string;
	country: string;
	user_agent: string;
}

async function parseRequestData(request: Request<unknown, CfProperties>) {
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

	// Name has "domain like" parts, mnaye be a url or an email
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

	// Message has "domain like" parts, mnaye be a url or an email
	if (/[a-z]\.[a-z]{2,}/iu.test(data.message)) {
		throw new ErrorResponse('Invalid "message".');
	}

	return data as { name: string, message: string, token: string };
}

export async function getMessages(request: Request<unknown, CfProperties>) {
	// TODO: list messages in a paginated way
}

export async function sendMessage(request: Request<unknown, CfProperties>) {
	try {
		const data = await parseRequestData(request);
		const visitorId = await generateVisitorId(request);

		const { timestamp } = (await env.Database.prepare(`
			SELECT timestamp
			FROM guestbook
			WHERE visitor_id = ?
			ORDER BY timestamp DESC
			LIMIT 1
		`).bind(visitorId).first<{ timestamp: string }>()) ?? {};

		// TODO: only allow one message per day
		// TODO: save new message
	} catch (err) {
		if (err instanceof ErrorResponse) {
			return err;
		}

		console.error(err);

		return new ErrorResponse('Failed to process request.');
	}
}
