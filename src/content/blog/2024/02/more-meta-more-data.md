---
title: More Meta, More Data
summary: An adenda about using metadata with react and other frameworks.
image: ./assets/think-tank.png
imageAlt: "A screenshot of the Think Tank from Fallout: New Vegas' DLC Old World Blues. The image consists of a background with some big stairs and an industrial style catwalk platform, and in front of it five reflectors pointing towards floating robots. The robots all have a brain encased in glass and three CRT monitors in front of them, two showing eyes and one showing a mouth hanging slightly below the eyes."
createdAt: 2024-02-27T01:06:43+00:00
updatedAt: 2026-02-04T15:18:34.000-05:00
updates:
  - date: 2026-02-04T15:18:34.000-05:00
    changes: Fixed Github URL.
tags:
  - BuildingInPublic
  - BuildInTheOpen
  - coding
  - FrontendDevelopment
  - meta
  - web
  - VintageTech
relatedPosts:
  - going-astro
  - blog-structure
  - xml-is-not-dead
  - metadata-for-the-masses
---

On my previous post about metadata, I got a comment from [Jack Zhou](https://www.linkedin.com/in/haopengzhou/) asking to expand on how that applies to dynamic content and frameworks like react and decided to cover this topic here.

Well, in short meta tags don't work with react. Good night and thank you for coming to my TED talk.

![A gif of movie credits rolling up.](./assets/roll-credits.gif)

## Seriously, it doesn't

Jokes aside, tools that read your page and parse metadata like the [schema.org validator](https://validator.schema.org/) or [Facebook's Open Graph debugger](https://developers.facebook.com/tools/debug/) will only read your page's _static_ HTML and **won't** execute any JavaScript. That means react won't even run so whatever you put on the meta tags for your page must be part of the initial html send down the wire, meaning it is either statically generated or server rendered.

## Static noise

The easiest way to get react to play nice with meta tags is to use one of the many flavors of meta frameworks, like [Next](https://nextjs.org/), [Remix](https://remix.run/) or [Astro](https://astro.build/). That solves the problem without many issues, and honestly, unless you need super specific dynamic applications, then your site or app should be statically build.

Which leads me to the next point...

## What is even an app?

It all boils down to _what_ you are building, what is the _purpose_ of your project?

If you want to build something that resembles a blog, a series of pages, or even a shopping application that needs to have direct links to things inside of the application _and_ be "shareable"[^1], then build a static page and add meta tags to each page.

It can even be driven by a template that fetches data from a database to construct an HTML. WordPress has been doing it in PHP or all things for over 20 years.

Here is an example of how this works in [this blog](https://github.com/madcampos/madcampos/blob/2e116b253f27944738d67ee9058e4002c9650cd3/src/components/HtmlHead.astro):

```astro
---

---
```

On the other hand, if you have a "highly dynamic app" in the sense that everything lives on the same "page", like a game, a photo editor, or a podcast player, then build a dynamic app and don't mind much about meta tags.

The tags in this case refer to your app _as a whole_ and not a specific part inside your app, so you can have all the needed tags on the app shell HTML file set only once and be done.

Here is an example of the app shell on an app from one of my [personal projects](https://github.com/madcampos/sdrlog/blob/0bea18137a4b2ebb1ae762da6e690205ba43cc9f/src/index.html#L16-L25):

```html
<html lang="en-US" itemscope itemtype="http://schema.org/WebSite">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1" />

		<title>Shadowrun Catalog</title>

		<!-- Preload -->

		<!-- App Metadata -->
		<link rel="icon" href="icons/favicon.svg" />
		<meta name="theme-color" content="#9400d3">

		<!-- Social metadata -->
		<meta name="keywords" content="shadowrun, sdr, rpg, books" />

		<meta property="og:title" name="twitter:title" itemprop="name" content="Shadowrun Catalog" />
		<meta property="og:description" name="description" itemprop="description" content="An interactive list of Shadowrun published material (books, tabletop, video games, etc.). Information about the items and can be linked to local files." />
		<meta property="og:image" name="twitter:image" itemprop="image" content="icons/transparent/manifest-icon-512.png" />
		<meta property="og:type" content="website" />
		<meta property="og:locale" content="en_US" />
		<meta property="og:url" content="https://sdrlog.madcampos.dev/" />
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:dnt" content="on">

		<meta name="pinterest" content="nopin" description="Pintrest not allowed here!">

		<!-- Search -->
		<!-- <link rel="search" href="/open-search.xml" type="application/opensearchdescription+xml" title="Shadowrun Catalog"> -->

		<!-- Site configuration -->
		<meta name="referrer" content="no-referrer">
		<meta name="format-detection" content="telephone=no">
		<meta name="google" content="notranslate" />
		<link rel="license" href="#copyright">

		<!-- Changelog -->
		<link rel="alternate" type="application/rss+xml" href="https://sdrlog.madcampos.dev/changelog.rss" title="Changelog (Version History)">

		<!-- Styles -->
		<link rel="stylesheet" href="./css/base.css" />
	</head>

	<body class="notranslate" translate="no">
		<div id="splash-screen">
			<div id="load-overlay">
				<img src="images/base-covers/loading-anim.svg" alt="Animation of the Shadowrun logo" role="presentation">
				<div>
					<progress id="load-progress"></progress>
					<p id="load-text">Loading Data...</p>
				</div>
			</div>
		</div>

		<script src="./js/main.ts" type="module"></script>
	</body>
</html>
```

[^1]: By shareable I mean that people want to see nice previews of the data when they copy and paste the link on whatever messenger app)
