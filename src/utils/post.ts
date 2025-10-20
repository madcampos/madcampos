import type { MarkdownInstance } from 'astro';
import { getImage } from 'astro:assets';
import { type CollectionEntry, getCollection, render } from 'astro:content';

export type PostSorting = 'ascending' | 'descending';

export const MAX_POSTS_PER_PAGE = 10;

export interface RelatedPost {
	id: string;
	url: string;
	title: string;
	summary: string;
	image?: ImageMetadata;
	imageAlt?: string;
	createdAt: Date;
}

export interface Post extends Omit<CollectionEntry<'blog'>, 'id' | 'relatedPosts'> {
	id: string;
	year: string;
	month: string;
	day: string;
	url: string;
	relatedPosts: RelatedPost[];
	readingTime: number;
	wordCount: number;
	letterCount: number;
}

function sortPostsByDate(first: Post, second: Post, sorting: PostSorting) {
	const firstDate = new Date(first.data.createdAt);
	const secondDate = new Date(second.data.createdAt);

	if (sorting === 'descending') {
		return secondDate.getTime() - firstDate.getTime();
	}

	return firstDate.getTime() - secondDate.getTime();
}

function getPostDate(post: CollectionEntry<'blog'>) {
	const postDate = new Date(post.data.createdAt);
	const year = postDate.getFullYear().toString();
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const month = (postDate.getMonth() + 1).toString().padStart(2, '0');
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const day = postDate.getDate().toString().padStart(2, '0');

	return {
		date: postDate,
		year,
		month,
		day
	};
}

function formatPostId(post: CollectionEntry<'blog'>) {
	const id = post.id.split('/').pop() ?? '';

	return id;
}

function getPostUrl(post: CollectionEntry<'blog'>) {
	const id = formatPostId(post);
	const { year, month } = getPostDate(post);

	return `${year}/${month}/${id}/`;
}

async function getRelatedPosts(post: CollectionEntry<'blog'>) {
	const blogEntries = await getCollection('blog');
	const posts = blogEntries.filter(({ data: { draft } }) => !draft || import.meta.env.DEV);

	const relatedPosts: RelatedPost[] = [];

	for (const relatedPost of post.data.relatedPosts ?? []) {
		const otherPost = posts.find((entry) => formatPostId(entry) === relatedPost);

		if (otherPost) {
			relatedPosts.push({
				id: formatPostId(otherPost),
				url: getPostUrl(otherPost),
				title: otherPost.data.title,
				summary: otherPost.data.summary,
				image: otherPost.data.image,
				imageAlt: otherPost.data.imageAlt,
				createdAt: otherPost.data.createdAt
			});
		}
	}

	return relatedPosts;
}

function countWords(text: string) {
	const words = (text?.split(/\s+/giu) ?? [])
		.filter((wordCandidate) => wordCandidate.length > 0)
		.filter((wordCandidate) => {
			const isHeader = (/^#+$/ui).exec(wordCandidate);

			return !isHeader;
		});

	return words.length;
}

const WORDS_PER_MINUTE = 200;

function calculateReadingTime(text: string) {
	const words = countWords(text);
	const minutes = words / WORDS_PER_MINUTE;

	return Math.ceil(minutes);
}

function countLetters(text: string) {
	const letters = (text?.split('') ?? []).filter((letter) => (/[a-z]/iu).exec(letter));

	return letters.length;
}

async function formatPostMetadata(post: CollectionEntry<'blog'>) {
	const id = formatPostId(post);
	const { year, month, day } = getPostDate(post);

	return {
		...post,
		id,
		year,
		month,
		day,
		url: getPostUrl(post),
		relatedPosts: await getRelatedPosts(post),
		readingTime: calculateReadingTime(post.body ?? ''),
		wordCount: countWords(post.body ?? ''),
		letterCount: countLetters(post.body ?? '')
	};
}

export async function listAllPosts(sorting: PostSorting = 'descending') {
	const posts = await getCollection('blog');
	const postFiles = import.meta.glob<MarkdownInstance<{}>>('../content/blog/**/*.md', { eager: true });

	const filteredPosts = posts.filter(({ data: { draft } }) => !draft || import.meta.env.DEV);
	const formattedPosts = await Promise.all(filteredPosts.map(async (post) => {
		const formattedPost = await formatPostMetadata(post);
		const [, postMarkdown] = Object.entries(postFiles).find(([filePath]) => filePath.includes(formattedPost.url)) ?? [];

		return {
			...formattedPost,
			render: async () => render(formattedPost),
			renderString: async () => postMarkdown?.compiledContent() ?? '',
			getImage: async () => formattedPost.data.image ? getImage({ src: formattedPost.data.image, format: 'png' }) : undefined
		};
	}));
	const sortedPosts = formattedPosts.sort((postA, postB) => sortPostsByDate(postA, postB, sorting));

	return sortedPosts;
}

export async function listPostPagesByYear(sorting: PostSorting = 'descending') {
	const posts = await listAllPosts(sorting);

	return Map.groupBy(posts, ({ year }) => year);
}

export async function listPostsByYearAndMonth(sorting: PostSorting = 'descending') {
	const postsByYear = await listPostPagesByYear(sorting);
	const postsByYearAndMonth = new Map<string, Map<string, Post[]>>();

	for (const [year, posts] of postsByYear.entries()) {
		postsByYearAndMonth.set(year, Map.groupBy(posts, ({ month }) => month));
	}

	return postsByYearAndMonth;
}

export async function listPostsByTag(sorting: PostSorting = 'descending') {
	const posts = await listAllPosts(sorting);

	const tags: Record<string, Post[]> = {};

	for (const post of posts) {
		for (const tag of post.data.tags ?? []) {
			tags[tag] ??= [];

			tags[tag]?.push(post as Post);
		}
	}

	for (const tag of Object.keys(tags)) {
		tags[tag]?.sort((postA, postB) => sortPostsByDate(postA, postB, sorting));
	}

	return tags;
}
