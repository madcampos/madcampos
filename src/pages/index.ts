import { html, render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import type { RouteView } from '../../lib/StaticSiteHandler.ts';
import { avatar } from '../components/Avatar/Avatar.ts';
import { baseLayout } from '../components/Baselayout/BaseLayout.ts';
import { logo } from '../components/Logo/Logo.ts';
import { oldStyleButtons } from '../components/OldStyleButtons/OldStyleButtons.ts';
import { themeSwitcher } from '../components/ThemeSwitcher/ThemeSwitcher.ts';
import { webrings } from '../components/Webrings/Webrings.ts';
import { BLOG, GLOBALS, PROJECTS, TALKS } from '../utils/constants.ts';

const userAvatar = avatar({
	src: '/assets/images/me.jpg',
	alt: "A picture of my face with a smile looking at the camera. I'm wearing aviator glasses, a fake fur winter hat and an orange scarf.",
	loading: 'eager'
});

export default {
	render: async () =>
		new Response(
			await collectResult(render(baseLayout({
				htmlTitle: [...GLOBALS.title, 'Senior Web Developer'],
				title: GLOBALS.titleString,
				description: GLOBALS.description,
				url: GLOBALS.url,
				tags: GLOBALS.tags,
				pageSchema: 'ProfilePage',
				baseUrl: 'https://madcampos.dev/',
				styles: ['/css/pages/home.css'],
				body: html`
					<div class="h-card vcard">
						<h1>
							${logo({ subtitle: '', shortSubtitle: '', url: '/', urlTitle: 'Home page' })}
						</h1>
						<article id="about" itemprop="mainEntity" itemtype="https://schema.org/Person" itemscope>
							<aside>
								${userAvatar}
							</aside>
							<div>
								<div class="p-note note" itemprop="description">
									<p>
										Hi there! My name is <em class="p-name fn n" itemprop="name"><span class="p-given-name given-name" itemprop="givenName">Marco</span>
											<span class="p-family-name family-name" itemprop="familyName">Campos</span></em>. I go by <em>@</em>
										<em class="p-nickname nickname" itemprop="alternateName">madcampos</em> on most social networks and my pronouns are he/him!
										<br />
										I'm a <span class="p-category category p-job-title" itemprop="jobTitle">Senior Web Developer</span> based in <span
											class="p-adr adr"
											itemprop="address"
											itemscope
											itemtype="https://schema.org/PostalAddress"
										><span class="p-locality locality" itemprop="addressLocality">Toronto</span>, <span class="p-country-name country-name" itemprop="addressCountry"
											>Canada</span></span>.
									</p>

									<p>I have experience with both frontend and backend development, with focus on responsive and accessible design, typescript and node.js.</p>
								</div>

								<p>You can find my projects, personal work, blog and some social networks on the links below:</p>
								<nav>
									<ul>
										<li>
											<a href="${BLOG.url}">
												<m-icon icon="uil:file-edit"></m-icon>
												My Blog
											</a>
										</li>
										<li>
											<a href="${PROJECTS.url}">
												<m-icon icon="uil:flask"></m-icon>
												Project Highlights
											</a>
										</li>
										<li>
											<a href="${TALKS.url}">
												<m-icon icon="uil:presentation-check"></m-icon>
												Talks I've given
											</a>
										</li>
										<li>
											<a href="https://github.com/madcampos" rel="noreferrer noopener me authn" referrerpolicy="no-referrer" itemprop="sameAs">
												<m-icon icon="uil:github-alt"></m-icon>
												GitHub
											</a>
										</li>
										<li>
											<a href="https://codepen.io/madcampos" rel="noreferrer noopener me" referrerpolicy="no-referrer" itemprop="sameAs">
												<m-icon icon="brandico:codepen"></m-icon>
												CodePen
											</a>
										</li>
										<li>
											<a href="https://www.linkedin.com/in/madcampos/" rel="noreferrer noopener" referrerpolicy="no-referrer" itemprop="sameAs">
												<m-icon icon="uil:linkedin-alt"></m-icon>
												LinkedIn
											</a>
										</li>
										<li>
											<a href="mailto:me@madcampos.dev" rel="me">
												<m-icon icon="uil:envelope"></m-icon>
												<span class="u-email email" itemprop="email">me@madcampos.dev</span>
											</a>
										</li>
									</ul>
								</nav>
							</div>
						</article>
					</div>
				`,
				footer: html`
					${oldStyleButtons}
					${webrings}
					${themeSwitcher}
				`
			}))),
			{ status: 200, headers: { 'Content-Type': 'text/html' } }
		)
} satisfies RouteView;
