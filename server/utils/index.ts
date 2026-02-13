/* eslint-disable @typescript-eslint/only-throw-error, @typescript-eslint/prefer-nullish-coalescing */
import { env } from 'cloudflare:workers';

export const STATUS_OK = 200;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_CONFLICT = 409;

export const blockedCountryList = ['IL'];

export const DEFAULT_HEADERS = {
	'Access-Control-Allow-Origin': env.NODE_ENV === 'production' ? 'https://madcampos.dev' : '*',
	'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Expose-Headers': '*',
	'Access-Control-Max-Age': '86400'
};

export interface PaginatedResponse<T = unknown> {
	/** array containing the page’s slice of data that you passed to the paginate() function */
	data: T[];
	/** metadata */
	/** the count of the first item on the page, starting from 0 */
	start: number;
	/** the count of the last item on the page, starting from 0 */
	end: number;
	/** total number of results */
	total: number;
	/** the current page number, starting from 1 */
	currentPage: number;
	/** number of items per page (default: 10) */
	size: number;
	/** number of last page */
	lastPage: number;
	url: {
		/** url of the current page */
		current: string,
		/** url of the previous page (if there is one) */
		prev?: string,
		/** url of the next page (if there is one) */
		next?: string,
		/** url of the first page (if the current page is not the first page) */
		first?: string,
		/** url of the last page (if the current page in not the last page) */
		last?: string
	};
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

export interface RequestMetadata {
	country: Iso3166Alpha2Code | 'T1';
	userAgent: string;
	ipAddress: string;
	accept: string;
	acceptLanguage: string;
	acceptEncoding: string;
}

export function parseRequestMetadata(request: Request<unknown, CfProperties>) {
	const country = request.cf?.country as Iso3166Alpha2Code | 'T1' | null;
	const userAgent = request.headers.get('User-Agent');
	const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');

	if (!country || !userAgent || !ipAddress) {
		throw new ErrorResponse('Annonymus request are not allowed.');
	}

	if (blockedCountryList.includes(country)) {
		throw new ErrorResponse('Blocked country');
	}

	const accept = request.headers.get('Accept');
	const acceptLanguage = request.headers.get('Accept-Language');
	const acceptEncoding = request.headers.get('Accept-Encoding');

	if (!accept || !acceptEncoding || !acceptLanguage) {
		throw new ErrorResponse('Non browser requests are not allowed.');
	}

	// TODO: block ip addresses?

	return {
		country,
		userAgent,
		ipAddress,
		accept,
		acceptEncoding,
		acceptLanguage
	} satisfies RequestMetadata;
}

export async function generateVisitorId({
	accept,
	acceptEncoding,
	acceptLanguage,
	country,
	userAgent,
	ipAddress
}: RequestMetadata) {
	const data = JSON.stringify({
		// postalCode: request.cf?.postalCode,
		// city: request.cf?.city,
		// metroCode: request.cf?.metroCode,
		// region: request.cf?.region,
		// regionCode: request.cf?.regionCode,
		// colo: request.cf?.colo,
		// continent: request.cf?.continent,
		// asn: request.cf?.asn,
		// timezone: request.cf?.timezone,
		// lattitude: request.cf?.latitude,
		// longitude: request.cf?.longitude,
		country,
		ipAddress,
		userAgent,
		accept,
		acceptLanguage,
		acceptEncoding
	});
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

	// @ts-expect-error - Typescript is missing the string conversion method
	return new Uint8Array(hashBuffer).toHex() as string;
}

export function simpleOptionsResponse() {
	return new Response(null, { status: STATUS_OK, headers: DEFAULT_HEADERS });
}
