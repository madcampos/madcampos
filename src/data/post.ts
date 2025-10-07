/* eslint-disable @typescript-eslint/no-magic-numbers */

import { basename, join } from '@std/path/posix';
import type { MarkdownEntry, SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

export type PostSorting = 'ascending' | 'descending';

export const MAX_POSTS_PER_PAGE = 10;

interface OriginalPostUpdate {
	date: Date;
	changes: string;
}

export interface PostUpdate extends Omit<OriginalPostUpdate, 'date'> {
	date: string;
	formattedDate: string;
	changes: string;
}

export interface RelatedPostMetadata {
	id: string;
	title: string;
	summary: string;
	createdAt: string;
	formattedCreatedAt: string;
	image?: string;
	imageAlt?: string;
}

interface OriginalPostMetadata {
	title: string;
	summary: string;
	createdAt: Date;
	updatedAt?: Date;
	draft?: boolean;
	tags?: string[];
	image?: string;
	imageAlt?: string;
	updates?: OriginalPostUpdate[];
	relatedPosts?: string[];
}

export interface PostMetadata extends Omit<OriginalPostMetadata, 'createdAt' | 'relatedPosts' | 'updatedAt' | 'updates'> {
	createdAt: string;
	formattedCreatedAt: string;
	updatedAt?: string;
	formattedUpdatedAt?: string;
	year: string;
	month: string;
	day: string;
	tags: string[];
	updates: PostUpdate[];
	relatedPosts: RelatedPostMetadata[];
	readingTime: number;
	wordCount: number;
	letterCount: number;
}

type Posts = Record<string, MarkdownEntry<PostMetadata>>;

function sortPostsByDate(first: MarkdownEntry<PostMetadata>, second: MarkdownEntry<PostMetadata>, sorting: PostSorting = 'descending') {
	const firstDate = new Date(first.metadata.createdAt);
	const secondDate = new Date(second.metadata.createdAt);

	if (sorting === 'descending') {
		return secondDate.getTime() - firstDate.getTime();
	}

	return firstDate.getTime() - secondDate.getTime();
}

export const sort: SortingFunction<PostMetadata> = ([, postA], [, postB]) => sortPostsByDate(postA, postB);

function countWords(text: string) {
	const words = (text?.split(/\s+/giu) ?? [])
		.filter((wordCandidate) => wordCandidate.length > 0)
		.filter((wordCandidate) => {
			const isHeader = (/^#+$/ui).exec(wordCandidate);

			return !isHeader;
		});

	return words.length;
}

function countLetters(text: string) {
	const letters = (text?.split('') ?? []).filter((letter) => (/[a-z]/iu).exec(letter));

	return letters.length;
}

const WORDS_PER_MINUTE = 200;

function calculateReadingTime(words: number) {
	const minutes = words / WORDS_PER_MINUTE;

	return Math.ceil(minutes);
}

export const transform: TransformerFunction<OriginalPostMetadata, PostMetadata> = async (
	assets,
	{
		entry: { metadata, id, path, contents },
		collections,
		imageOptimizer,
		mode
	}
) => {
	if (mode === 'production' && metadata?.draft) {
		return;
	}

	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });
	const postDate = new Date(metadata.createdAt);
	const year = postDate.getFullYear().toString();
	const month = (postDate.getMonth() + 1).toString().padStart(2, '0');
	const day = postDate.getDate().toString().padStart(2, '0');
	const wordCount = countWords(contents);
	const relatedPosts: RelatedPostMetadata[] = [];

	let image: string | undefined;

	if (metadata?.image) {
		image = await imageOptimizer.addImageToCache(assets, {
			src: collections.resolveImagePath(metadata.image, path)
		});
	}

	if (metadata.relatedPosts) {
		const posts = Object.entries(await collections.list<OriginalPostMetadata | PostMetadata>(assets, 'blog')).filter(([postId]) =>
			metadata.relatedPosts?.find((relatedId) => relatedId.endsWith(postId))
		);

		for (const [relatedId, { metadata: relatedMetadata }] of posts) {
			const relatedDate = new Date(relatedMetadata.createdAt);
			const relatedYear = relatedDate.getFullYear().toString();
			const relatedMonth = (relatedDate.getMonth() + 1).toString().padStart(2, '0');

			let relatedImage: string | undefined;

			if (relatedMetadata?.image) {
				relatedImage = await imageOptimizer.addImageToCache(assets, {
					src: collections.resolveImagePath(relatedMetadata.image, relatedId)
				});
			}

			relatedPosts.push({
				id: join(relatedYear, relatedMonth, basename(relatedId)),
				title: await collections.renderInlineMarkdown(assets, relatedMetadata.title),
				summary: await collections.renderInlineMarkdown(assets, relatedMetadata.summary),
				createdAt: relatedDate.toISOString(),
				formattedCreatedAt: formatter.format(relatedDate),
				image: relatedImage,
				imageAlt: relatedMetadata.imageAlt
			});
		}
	}

	return {
		id: join(year, month, basename(id)),
		path,
		contents,
		metadata: {
			title: await collections.renderInlineMarkdown(assets, metadata.title),
			summary: await collections.renderInlineMarkdown(assets, metadata.summary),
			draft: metadata.draft,
			createdAt: postDate.toISOString(),
			formattedCreatedAt: formatter.format(postDate),
			updatedAt: metadata.updatedAt ? metadata.updatedAt.toISOString() : undefined,
			formattedUpdatedAt: metadata.updatedAt ? formatter.format(metadata.updatedAt) : undefined,
			image,
			imageAlt: metadata.imageAlt,
			year,
			month,
			day,
			wordCount,
			letterCount: countLetters(contents),
			readingTime: calculateReadingTime(wordCount),
			tags: metadata.tags ?? [],
			updates: (metadata.updates ?? []).map((update) => ({
				...update,
				date: update.date.toISOString(),
				formattedDate: formatter.format(update.date)
			})),
			relatedPosts
		}
	};
};

export function listAllYears(posts: Posts) {
	return [...new Set(Object.values(posts).map(({ metadata: { year } }) => year))];
}

export function getPostsForYear(posts: Posts, year: string, sorting: PostSorting = 'descending') {
	return Object.fromEntries(
		Object.entries(posts)
			.filter(([, { metadata: { year: postYear } }]) => postYear === year)
			.sort(([, postA], [, postB]) => sortPostsByDate(postA, postB, sorting))
	);
}

export function listAllMonthsForYear(posts: Posts, year: string) {
	return [...new Set(Object.values(posts).filter(({ metadata: { year: postYear } }) => postYear === year).map(({ metadata: { month } }) => month))];
}

export function getPostsForMonth(posts: Posts, year: string, month: string, sorting: PostSorting = 'descending') {
	return Object.fromEntries(
		Object.entries(posts)
			.filter(([, { metadata: { year: postYear, month: postMonth } }]) => postYear === year && postMonth === month)
			.sort(([, postA], [, postB]) => sortPostsByDate(postA, postB, sorting))
	);
}

export function listAllTags(posts: Posts) {
	return [...new Set(Object.values(posts).flatMap(({ metadata: { tags } }) => tags))];
}

export function getAllPostsForTag(posts: Posts, tag: string, sorting: PostSorting = 'descending') {
	return Object.fromEntries(
		Object.entries(posts)
			.filter(([, { metadata: { tags } }]) => tags.includes(tag))
			.sort(([, postA], [, postB]) => sortPostsByDate(postA, postB, sorting))
	);
}
