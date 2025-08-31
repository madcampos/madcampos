import { html } from '@lit-labs/ssr';
import { when } from 'lit/directives/when.js';
import { join } from '../../utils/path.ts';

interface Props {
	baseUrl: string;
	currentPage: number;
	lastPage: number;
	prevUrl?: string;
	nextUrl?: string;
	start: number;
	end: number;
	total: number;
	size: number;
}

export function pagination({ baseUrl, currentPage, lastPage, prevUrl, nextUrl, start, end, total, size }: Props) {
	const TRIM_PAGE_NUMBER = 2;
	const firstPageInNav = Math.max(1, currentPage - TRIM_PAGE_NUMBER);
	const lastPageInNav = Math.min(lastPage, currentPage + TRIM_PAGE_NUMBER);
	const navLinks = Array(lastPageInNav - firstPageInNav + 1).fill(null).map((_, i) => {
		const currentPageNumber = firstPageInNav + i;
		const href = currentPageNumber === 1 ? '' : currentPageNumber.toString();

		return html`<li>
			<a
				href="${join([baseUrl, href])}"
				?aria-current="${currentPageNumber === currentPage ? 'page' : null}"
			>
				<sr-only>Page</sr-only>
				<span>${currentPageNumber.toString()}</span>
			</a>
		</li>`;
	});

	const firstPageLink = when(
		firstPageInNav > 1,
		() =>
			html`
					<li>
						<a href="${join([baseUrl, '/'])}">
							<sr-only>Page</sr-only>
							<span>1</span>
						</a>
					</li>
					<li><span>…</span></li>
				`
	);

	const lastPageLink = when(
		lastPageInNav < lastPage,
		() =>
			html`
					<li><span>…</span></li>
					<li>
						<a href="${join([baseUrl, lastPage.toString()])}">
							<sr-only>Page</sr-only>
							<span>${lastPage}</span>
						</a>
					</li>
				`
	);

	return html`
		<m-pagination>
			<nav aria-labelledby="page-links-label">
				<sr-only id="page-links-label">Pages Links</sr-only>

				<div>
					<a
						href="${join([baseUrl])}"
						id="first-page"
					>
						<m-icon icon="uil:angle-double-left"></m-icon>
						<span class="pagination-link-text">
							<span>First</span>
							<sr-only>page</sr-only>
						</span>
					</a>

					<a
						?href="${prevUrl ? join([prevUrl]) : null}"
						?aria-disabled="${!prevUrl ? 'true' : null}"
						id="prev-page"
					>
						<m-icon icon="uil:angle-left"></m-icon>
						<span class="pagination-link-text">
							<span>Previous</span>
							<sr-only>page</sr-only>
						</span>
					</a>

					<ol>
						${firstPageLink}

						${navLinks}

						${lastPageLink}
					</ol>

					<a
						?href="${nextUrl ? join([nextUrl]) : null}"
						?aria-disabled="${!nextUrl ? 'true' : null}"
						id="next-page"
					>
						<span class="pagination-link-text">
							<span>Next</span>
							<sr-only>page</sr-only>
						</span>
						<m-icon icon="uil:angle-right"></m-icon>
					</a>

					<a
						href="${join([baseUrl, lastPage.toString()])}"
						id="last-page"
					>
						<span class="pagination-link-text">
							<span>Last</span>
							<sr-only>page</sr-only>
						</span>
						<m-icon name="uil:angle-double-right"></m-icon>
					</a>
				</div>
				<aside>${start + 1} &mdash; ${end + 1} of ${total} (${size} per page)</aside>
			</nav>
		</m-pagination>
	`;
}
