import { env } from 'cloudflare:workers';

export interface TurnsTileValidationSuccessResponse {
	'success': true;
	'challenge_ts': string;
	'hostname': string;
	'error-codes': [];
	'action': string;
	'cdata': unknown;
	'metadata'?: {
		ephemeral_id: string
	};
}

export type TurnstileErrorCodes =
	| 'bad-request'
	| 'internal-error'
	| 'invalid-input-response'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'missing-input-secret'
	| 'timeout-or-duplicate';

export interface TurnstileValidationFailureResponse {
	'success': false;
	'error-codes': TurnstileErrorCodes[];
}

export type TurnstileValidationResponse = TurnstileValidationFailureResponse | TurnsTileValidationSuccessResponse;

export interface ValidatorOptions {
	idempotencyKey?: string;
	host?: string;
}

export class TurnstileValidator {
	static readonly #TURNSTILE_SECRET_KEY = env.NODE_ENV === 'production' ? env.TURNSTILE_SECRET_KEY : '1x0000000000000000000000000000000AA';
	static readonly #TIMEOUT_IN_MS = 10000;
	static readonly #MAX_TOKEN_LENGTH = 2048;

	static async validate(token: string, remoteip: string, options: ValidatorOptions = {}) {
		if (!token || typeof token !== 'string') {
			return { 'success': false, 'error-codes': ['missing-input-response'] } satisfies TurnstileValidationFailureResponse;
		}

		if (token.length > TurnstileValidator.#MAX_TOKEN_LENGTH) {
			return { 'success': false, 'error-codes': ['invalid-input-response'] } satisfies TurnstileValidationFailureResponse;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), TurnstileValidator.#TIMEOUT_IN_MS);

		try {
			const formData = new FormData();
			formData.append('secret', TurnstileValidator.#TURNSTILE_SECRET_KEY);
			formData.append('response', token);
			formData.append('remoteip', remoteip);

			if (options.idempotencyKey) {
				formData.append('idempotency_key', options.idempotencyKey);
			}

			const response = await fetch(
				'https://challenges.cloudflare.com/turnstile/v0/siteverify',
				{
					method: 'POST',
					body: formData,
					signal: controller.signal
				}
			);

			const result = await response.json<TurnstileValidationResponse>();

			if (result.success) {
				if (options.host && result.hostname !== options.host) {
					return { 'success': false, 'error-codes': ['bad-request'] } satisfies TurnstileValidationFailureResponse;
				}
			}

			return result;
		} catch (error) {
			if (error.name === 'AbortError') {
				return { 'success': false, 'error-codes': ['invalid-input-response'] } satisfies TurnstileValidationFailureResponse;
			}

			console.error('Turnstile validation error:', error);
			return { 'success': false, 'error-codes': ['internal-error'] } satisfies TurnstileValidationFailureResponse;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
