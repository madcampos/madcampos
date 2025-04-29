import { type SchemaContext, z as zod } from 'astro:content';

export const blogSchema = ({ image }: SchemaContext) =>
	zod.object({
		title: zod.string().describe('The post title that will be displayed as the top of the post page or as the heading on lists.'),
		summary: zod.string().describe('A summary for the post that will show in list pages.'),
		createdAt: zod.date().describe("The post's creation date."),
		updatedAt: zod.date().optional().describe("The post's last update date."),
		draft: zod.boolean().optional().describe('Whether the post is a draft or not.'),

		image: image().optional().describe('Post\'s Main "hero" image path, relative path to the post file.'),
		imageAlt: zod.string().optional().describe('Main image alt text.'),
		imageRights: zod.string().optional().describe('Copyright information for the image, if any.'),

		tags: zod.array(zod.string()).optional().describe('Tags for this post.'),
		relatedPosts: zod.array(zod.string()).optional().describe('Slugs for posts related to this.'),

		updates: zod.array(zod.object({
			date: zod.date().describe('The date of the update.'),
			changes: zod.string().describe('A summary of the changes in this update.')
		})).optional().describe('A list of updates this post had.')
	});
