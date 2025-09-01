import { html } from '@lit-labs/ssr';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { inlineMarkdownRender, inlineMarkdownStrip } from '../../utils/markdown.ts';

interface Props {
	name: string;
	description: string;
	avatar: string;
	avatarAlt: string;
	url?: string;
	isDraft?: boolean;
}

export function authorCard({ name, description, avatar, avatarAlt, url, isDraft }: Props) {
	return html`
		<author-card>
			<aside itemprop="author" itemscope itemtype="https://schema.org/Person">
				<a class="author-picture" ?href="${url}">
					<m-avatar
						itemprop="image"
						itemscope
						itemtype="https://schema.org/ImageObject"
					>
						<!-- TODO: generate sources for images -->
						<!-- Sizes: 128, 256, 512, 768, 1024 -->
						<img
							class="u-photo photo"
							itemprop="contentUrl"
							src="${avatar}"
							alt="${inlineMarkdownStrip(avatarAlt)}"
							loading="lazy"
							decoding="async"
							srcset=""
							width="128"
							height="128"
							sizes="(max-width: 360px) 128px, (max-width: 720px) 256px, (max-width: 1280px) 512px, (max-width: 2160px) 768px 1024px"
						/>
					</m-avatar>
				</a>

				<a class="p-author h-card author-name" rel="author" itemprop="url" ?href="${url}">
					<h2 itemprop="name">
						${when(isDraft, () => html`<draft-tag>Draft</draft-tag>`)}
						${unsafeHTML(inlineMarkdownRender(name))}
					</h2>
				</a>

				<div class="author-bio">
					<small>
						${unsafeHTML(description)}
					</small>
				</div>
			</aside>
		</author-card>
	`;
}
