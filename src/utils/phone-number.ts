import { htmlEncode } from './email.ts';

export function encodePhoneNumber(phoneNumber?: string, formatNumber = false) {
	const { country = '1', area = '647', prefix = '867', number = '6157' } =
		(/\+?(?<country>\d)\s?(?<area>\d{3})\s?(?<prefix>\d{3})-?(?<number>\d+)/iu.exec(phoneNumber ?? ''))?.groups ?? {};

	if (formatNumber) {
		const numberSplit = Math.floor(Math.random() * (number.length - 1)) + 1;
		const formattedFirstPart = number.slice(0, numberSplit);
		const formattedSecondPart = number.slice(numberSplit);

		// dprint-ignore-line
		return `+${htmlEncode(country)} <!-- beep -->${htmlEncode(area)}<!-- boop --> ${htmlEncode(prefix)}-${htmlEncode(formattedFirstPart)}<!-- foo bar -->${htmlEncode(formattedSecondPart)}`;
	}

	const joinedNumber = `${country}${area}${prefix}${number}`;
	const randomSplit = Math.floor(Math.random() * (joinedNumber.length - 1)) + 1;
	const firstPart = joinedNumber.slice(0, randomSplit);
	const secondPart = joinedNumber.slice(randomSplit);

	return `+${htmlEncode(firstPart)}${htmlEncode(secondPart)}`;
}
