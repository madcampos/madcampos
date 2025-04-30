import template from './template.html?raw';

interface CodepenEmbedData {
	id: string;
	title: string;
	username: string;
}

export function render(inputData: CodepenEmbedData) {
	return template
		.replaceAll(/\{\{(.+?)\}\}/igu, (_, property: string) => (inputData[property as keyof CodepenEmbedData] ?? '').toString())
		.trim()
		.replaceAll(/\n\t+/giu, ' ');
}
