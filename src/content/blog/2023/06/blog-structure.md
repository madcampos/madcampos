---
title: The Semantics of Blogging
createdAt: 2023-06-05T20:54:23.000-04:00
updatedAt: 2026-02-04T15:18:34.000-05:00
updates:
  - date: 2023-06-07T19:39:00.000-04:00
    changes: Slight review of the content.
  - date: 2024-02-02T03:21:00.000-05:00
    changes: Added an image to the post.
  - date: 2026-02-04T15:18:34.000-05:00
    changes: Fixed Github URL.
summary: A dive into the semantic html of a blog.
image: ./assets/linear-a.jpg
imageAlt: "A photo of a fragment of a clay tablet showing inscriptions in the Linear A script."
imageRights: "Linear A tablet from the palace of Zakros, Archeological Museum of Sitia. Source: [Wikipedia](https://commons.wikimedia.org/wiki/File:Sitia_Museum_Linear_A_02.jpg)"
tags:
  - BuildInTheOpen
  - meta
  - coding
  - vite
  - TS
  - TypeScript
  - BuildingInPublic
  - BreakIntoTech
  - LearnToCode
  - FrontendDevelopment
relatedPosts:
  - hello-world
  - going-astro
---

Building an HTML page is fun... until you find yourself lost in a sea of meaningless `<div>`s.

The problem with HTML tags and, by extension the problem with language in general, is that _naming_ and _categorizing_ things _is hard_! There is a whole field of taxonomy and people spend years getting a PhD thesis studying how to name and classify things.

## Anatomy of an Article Page

Let's start with the full markup for the article page and then break it down to it's parts. I'm only showing the `body` here for brevity, but you can see the full template in the [GitHub repo](https://github.com/madcampos/madcampos/blob/9f3ada31848ab387e2d4ac3faa53f02779e13eff/src/templates/blog/post.html).

```html
<body>
	<article>
		<div id="post-header">
			<nav id="back-to-blog">
				<!-- link to blog home, removed for brevity -->
			</nav>
			<header>
				<h1>{{title}}</h1>
				<aside>Published on <time itemprop="dateCreated" datetime="{{createdAt}}">{{formatDate createdAt}}</time></aside>
			</header>
		</div>

		<main id="post-contents" itemprop="articleBody">
			{{{content}}}
		</main>
	</article>
</body>
```

## What Is An `<article>`?

Interestingly, an `<article>` can mean more than a blog article, it can be also an item card on a e-commerce website, a recipe, or even a forum post. The idea is that an `<article>` is a standalone piece of content. It can be read on its own, and it makes sense on its own.

To quote from the [html spec](https://html.spec.whatwg.org/multipage/sections.html#the-article-element):

> _The article element represents a complete, or self-contained, composition in a document, page, application, or site and that is, in principle, independently distributable or reusable, e.g. in syndication. This could be a forum post, a magazine or newspaper article, a blog entry, a user-submitted comment, an interactive widget or gadget, or any other independent item of content._
>
> https://html.spec.whatwg.org/multipage/sections.html#the-article-element

This gives us a basic structure for creating a post:

```html
<article>
	<!-- Article navigation, for example, a table of contents -->
	<!-- (Can also be used for site navigation as seen patterns where the site has a "top navigation bar") -->
	...
	<!-- Title -->
	...
	<!-- Content -->
	...
</article>
```

The card used on the post lists use a similar structure. (Other templates, including recipes and forum posts will be covered in a future article):

```html
<article class="post-card">
	<header>
		<a href="{{url}}"><h2>{{title}}</h2></a>
		<a href="{{url}}"><span>{{createdAtDate}}</span></a>
	</header>
	{{{summary}}}
	<footer>
		<a href="{{url}}">Read more...</a>
	</footer>
</article>
```

## Keeping Your `<header>` In The Right Place

The header tag serves to represent _almost everything_ that comes before the main content of the page. By _almost everything_, I mean data and metadata related to the article, in the case `<nav>` doesn't belong in the header, but the `<aside>` does.

The reason behind it is that `<nav>` in that case is the _global_ page navigation. As for `<aside>`, it is metadata related to the article. That way things are organized and fulfill their semantic purpose.

## What About Metadata?

For adding metadata and representing it, there are mainly three ways to do it:

1. The regular HTML tags on the `<head>`,
2. [Open Graph](https://ogp.me/) tags, and
3. [Schema.org](https://schema.org/) properties.

The relevant tags inside the `<head>` looks somewhat like this:

```html
<meta charset="utf-8" />
<link rel="canonical" href="{{url}}" />
<link rel="alternate" type="application/rss+xml" href="/blog/rss.xml" title="Marco Campos' Blog" />

<title>{{title}} | Marco Campos | Blog</title>

<meta property="og:title" name="twitter:title" itemprop="name" content="{{title}}" />
<meta property="og:description" name="description" itemprop="abstract" content="{{summary}}" />
<meta property="og:image" name="twitter:image" itemprop="image" content="https://madcampos.dev/icons/transparent/manifest-icon-512.png" />

<meta property="og:type" content="article" />
<meta property="og:locale" itemprop="inLanguage" content="en_US" />
<meta property="og:url" itemprop="url" content="{{url}}" />

<meta name="twitter:card" content="summary" />
<meta name="twitter:dnt" content="on">
```

Thus,

1. The regular HTML tags on the `<head>`,
   - The more common `<title>` and `<link>` tags.
   - They link to the canonical version of the page, i.e. the blog post itself.
   - They also link to the RSS feed for the blog.
2. [Open Graph](https://ogp.me/) tags,
   - Are the ones where `property` starts with `og:`.
   - Used by social media sites to display a preview of the page when sharing it.
   - Started as as a Facebook thing, but now are used by other social media sites and search engines to display rich content.
3. [Schema.org](https://schema.org/) properties.
   - Are the `itemprop` on the page.
   - Used by search engines to display rich results.
   - Are older than Open Graph, but more widely used by search engines, like Google and Bing.
   - Provide a rich set of properties for different types of content.

## Headings Levels And Table of Contents

Having a good heading hierarchy is important for accessibility and for search engines. The most important item is the `<h1>` tag, it is the title of the page and should be only one of it.

When screen reader users use your site, they will have an `<h1>` spoken to them _first_, all other headers are children of the `<h1>`.

That is why all headings for posts on this blog are `<h2>`, except for the title.

If you want to make the text bigger **use CSS**.

## Conclusion

This is an extremely basic markup for a page, there is no "hero image" neither other metadata that may be needed. But it is a good starting point for a blog and it is [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and quite accessible.

I hope in the future to add more features and improve on the markup.
