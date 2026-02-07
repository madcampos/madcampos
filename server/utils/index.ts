/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { env } from 'cloudflare:workers';

export const STATUS_OK = 200;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_CONFLICT = 409;

export const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': env.NODE_ENV === 'production' ? 'https://madcampos.dev' : '*',
	'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Expose-Headers': '*',
	'Access-Control-Max-Age': '86400'
};

export async function generateVisitorId(request: Request<unknown, CfProperties>) {
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

export interface StatusResponse {
	success: boolean;
	message: string;
}

export class ErrorResponse extends Response {
	constructor(message: string, status = STATUS_BAD_REQUEST) {
		super(
			JSON.stringify(
				{
					success: false,
					message
				} satisfies StatusResponse
			),
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

export function simpleOptionsResponse() {
	return new Response(null, { status: STATUS_OK, headers: DEFAULT_HEADERS });
}
