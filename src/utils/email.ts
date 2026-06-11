export function htmlEncode(input: string) {
	return [...input].map((char) => `&#${char.codePointAt(0)};`).join('');
}

export function encodeEmail(emailAddress?: string, addComments = false) {
	const [addressPart = 'me', domainPart = 'madcampos.dev'] = emailAddress ? emailAddress.split('@') : [];

	const randomSplit = Math.floor(Math.random() * (domainPart.length - 1)) + 1;
	const firstPart = domainPart.slice(0, randomSplit);
	const secondPart = domainPart.slice(randomSplit);

	const encodedDomain = `${addComments ? '<!-- beep -->' : ''}${htmlEncode(firstPart)}${addComments ? '<!-- boop -->' : ''}${htmlEncode(secondPart)}`;
	const encodedAddress = `${htmlEncode(addressPart)}${addComments ? '<!-- xyzzy -->' : ''}`;

	return `${encodedAddress}@${encodedDomain}`;
}
