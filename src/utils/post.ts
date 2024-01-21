import { type CollectionEntry, getCollection } from 'astro:content';

export const MAX_POSTS_PER_PAGE = 10;

export interface RelatedPost {
	slug: string,
	url: string
}

export interface Post extends Omit<CollectionEntry<'blog'>, 'slug' | 'relatedPosts'> {
	slug: string,
	year: string,
	month: string,
	day: string,
	url: string,
	relatedPosts: RelatedPost[]
}

function sortPostsByDate(first: Post, second: Post) {
	const firstDate = new Date(first.data.updatedAt ?? first.data.createdAt);
	const secondDate = new Date(second.data.updatedAt ?? second.data.createdAt);

	return secondDate.getTime() - firstDate.getTime();
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

function formatPostSlug(post: CollectionEntry<'blog'>) {
	const slug = post.slug.split('/').pop() ?? '';

	return slug;
}

function getPostUrl(post: CollectionEntry<'blog'>) {
	const slug = formatPostSlug(post);
	const { year, month } = getPostDate(post);

	return `${year}/${month}/${slug}`;
}

async function getRelatedPosts(post: CollectionEntry<'blog'>) {
	const blogEntries = await getCollection('blog');
	const posts = blogEntries.filter(({ data: { draft } }) => !draft);

	const relatedPosts: RelatedPost[] = [];

	for (const otherPost of posts) {
		if (post.data.relatedPosts?.includes(otherPost.slug)) {
			relatedPosts.push({
				slug: formatPostSlug(otherPost),
				url: getPostUrl(otherPost)
			});
		}
	}

	return relatedPosts;
}

async function formatPostMetadata(post: CollectionEntry<'blog'>) {
	const slug = formatPostSlug(post);
	const { year, month, day } = getPostDate(post);

	return {
		...post,
		slug,
		year,
		month,
		day,
		url: getPostUrl(post),
		relatedPosts: await getRelatedPosts(post)
	};
}

export async function listAllPosts() {
	const blogEntries = await getCollection('blog');
	const filteredBlogEntries = blogEntries.filter(({ data: { draft } }) => !draft);
	const formattedBlogEntries = await Promise.all(filteredBlogEntries.map(async (entry) => formatPostMetadata(entry)));
	const sortedBlogEntries = formattedBlogEntries.sort(sortPostsByDate);

	return sortedBlogEntries;
}

export async function listPostPagesByYear() {
	const posts = await listAllPosts();

	const years: Record<string, Post[]> = {};

	for (const post of posts) {
		const year = post.year.toString();

		if (!years[year]) {
			years[year] = [];
		}

		years[year]?.push(post as Post);
	}

	for (const year of Object.keys(years)) {
		years[year]?.sort(sortPostsByDate);
	}

	return years;
}

export async function listPostsPagesByMonth() {
	const posts = await listPostPagesByYear();
	const postsByMonth: Record<string, Record<string, Post[]>> = {};

	for (const year of Object.keys(posts)) {
		const months: Record<string, Post[]> = {};

		for (const post of posts[year] as Post[]) {
			const month = post.month.toString();

			if (!months[month]) {
				months[month] = [];
			}

			months[month]?.push(post);
		}

		if (!postsByMonth[year]) {
			postsByMonth[year] = {};
		}

		postsByMonth[year] = months;
	}

	return postsByMonth;
}

export async function listPostPagesByTag() {
	const posts = await listAllPosts();

	const tags: Record<string, Post[]> = {};

	for (const post of posts) {
		for (const tag of post.data.tags ?? []) {
			if (!tags[tag]) {
				tags[tag] = [];
			}

			tags[tag]?.push(post as Post);
		}
	}

	for (const tag of Object.keys(tags)) {
		// eslint-disable-next-line max-len
		tags[tag]?.sort(sortPostsByDate);
	}

	return tags;
}