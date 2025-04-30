import template from './template.html?raw';

interface YoutubeEmbedData {
	id: string;
	title: string;
}

export function render(inputData: YoutubeEmbedData) {
	return template
		.replaceAll(/\{\{(.+?)\}\}/igu, (_, property: string) => (inputData[property as keyof YoutubeEmbedData] ?? '').toString())
		.trim()
		.replaceAll(/\n\t+/giu, ' ');
}
