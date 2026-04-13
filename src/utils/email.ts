export function htmlEncode(input: string) {
	return [...input].map((char) => `&#${char.codePointAt(0)};`).join('');
}

export function encodeEmail(shouldRemoveComments?: boolean, emailAddress?: string) {
	const [addressPart = 'me', domainPart = 'madcampos.dev'] = emailAddress ? emailAddress.split('@') : [];

	const randomSplit = Math.floor(Math.random() * (domainPart.length - 1)) + 1;
	const firstPart = domainPart.slice(0, randomSplit);
	const secondPart = domainPart.slice(randomSplit);

	const encodedDomain = `${shouldRemoveComments ? '' : '<!-- beep -->'}${htmlEncode(firstPart)}${shouldRemoveComments ? '' : '<!-- boop -->'}${htmlEncode(secondPart)}`;
	const encodedAddress = `${htmlEncode(addressPart)}${shouldRemoveComments ? '' : '<!-- xyzzy -->'}`;

	return `${encodedAddress}@${encodedDomain}`;
}
