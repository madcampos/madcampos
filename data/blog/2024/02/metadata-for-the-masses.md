---
title: Metadata for the masses
createdAt: 2024-02-12T03:22:18.915-05:00
summary: A guide on tools and how to add metadata to your website.
image: ./assets/web-pages.jpg
imageAlt: AI generated image of a pile of books covered in spider webs with mountains shining on the horizon in the background.
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
  - more-meta-more-data
---

After my [explorations on RSS](/blog/2023/06/xml-is-not-dead/) I was dragged into yet another rabbit hole... Metadata!

This is my journey on adding metadata to my website so it is compliant and tools are able to parse it nicely.

## Meta-what?

Meta-_data_! It comes from Greek, the prefix _meta-_ means "referring to itself". So "metadata" means "data about the data".

Imagine you have a book, the actual content of that book it its _data_. But information like the author, the date the book was published, the number of pages, how much it weighs, its taste, if it is hard or soft cover, etc. _all those things_ are metadata, they are _data_ about a piece of _data_.

As headache inducing as all of this discussion is, there is a good reason why we need metadata on our websites: to help computers understand things.

To give another example, my home page without metadata looks like this:

> Hi there! My name is _Marco Campos_ (@madcampos on most social networks)!
> I'm a Senior Web Developer based in Toronto, Canada.
>
> I have experience with both frontend and backend development, with focus on responsive and accessible design, typescript and node.js.
>
> You can find my projects, personal work, blog and some social networks on the links below:
>
> - [My Blog](http://localhost:3000/blog)
> - [Project Highlights](http://localhost:3000/projects)
> - [Talks I've given](http://localhost:3000/talks)
> - [GitHub](https://github.com/madcampos)
> - [CodePen](https://codepen.io/madcampos)
> - [LinkedIn](https://www.linkedin.com/in/madcampos/)

For us _humans_, this is fairly easy to understand, but for a _computer_ it is just a bunch of scrambled zeroes and ones. And no, AI doesn't "understand" you, it is just a super fancy auto complete.

So, how do we solve this problem and make computers understand things? We either tag parts of the content with special things that make them understand or we duplicate the data. Let's understand how all of this is done.

## It's all in your `<head>`

HTML is a neat language and it has some basic functionality to add extra information to your content. It is all in the tags we put on the [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head).

The most basic tag to add is [`<title>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title), it is your page's title and what will show on the browser tab bar.

You can also add [`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link), you can say what the link is about with the [`rel`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel) attribute. Two super important values for that attribute are [`alternate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#alternate) and [`canonical`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#canonical), they provide an alternative version of the document and the reference URL for the document, respectively.

The most _meta_ of all the tags is [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta). It provides a mechanism to set extra _metadata_ about the content, specifically using the attributes [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#name) and [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#content).

This is all fun but the [standard html vocabulary](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name) is quite limited and convey the idea of "text documents", not "apps".

Here is an abridged version of how the head of my home page looks like:

```html
<head>
	<meta charset="utf-8">
	<link rel="canonical" href="http://madcampos.dev/">

	<title>Marco Campos | Senior Web Developer</title>

	<link rel="icon" href="http://localhost:3000/icons/favicon.svg" sizes="any" type="image/svg+xml">

	<meta name="description" content="Marco Campos - Senior Web Developer - Vue.js, Node.js, TypeScript, JavaScript">
	<meta name="author" content="Marco Campos">
	<meta name="keywords" content="Senior web developer, web developer, vue.js, vue, node.js, javascript, typescript, webdev">

	<link rel="alternate" type="application/rss+xml" href="http://madcampos.dev/changelog.xml" title="Changelog (Version History)">
</head>
```

### "OpenGraph" a.k.a. "Facebook"

~~Facebook~~ Meta abused a little bit the meta tags of a website and introduced a protocol to provide more information to links we share on the platform. This information is expressed using [OpenGraph](https://ogp.me/).

It basically allows us to provide a nice title, description and image to a link, so when we share something a cool image pops up and not some random icon.

The unfortunate part of this is that some standard tags like `<title>` are mostly ignored and the OpenGraph alternative is used... So we have to duplicate content.

The "good" part is that you can annotate some of the tags to also serve as OpenGraph data.

Here is an example of the OpenGraph tags on the head of my home page:

```html
<head>
	<meta property="og:title" content="Marco Campos | Senior Web Developer">
	<meta property="og:type" content="website">
	<meta property="og:locale" content="en_US">
	<meta property="og:url" content="http://madcampos.dev/">
	<meta property="og:description" name="description" content="Marco Campos - Senior Web Developer - Vue.js, Node.js, TypeScript, JavaScript">
	<meta property="og:image" content="https://madcampos.dev/_astro/logo-micro.niOL6vSR.png">
	<meta property="og:image:alt" content="Logo for madcampos' site consisting of stylized &quot;{m}&quot; in blue.">
</head>
```

Most of the tags are duplicated, with the exception of the description that uses the original tag and only adds the `property` attribute.

### Other social networks

Luckily for us most social media platforms use the OpenGraph tags and only add things if needed be.

But for completeness sake, here are some links on documentation for other properties and social networks:

- [Twitter](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)
- [Pinterest](https://developers.pinterest.com/docs/rich-pins/rich-pins/)
- [LinkedIn](https://www.linkedin.com/post-inspector/)

## Yet another _schema_

The other format supported almost everywhere is [Microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata), it is actually written by the same standards body that write HTML so it is designed with markup in mind and integrates really well with that.

What makes this format really nice is the _extensive_ vocabulary for it in [Schema.org](https://schema.org). It is kinda hard to wrap your head around and find the best schema to describe what you are trying to describe, but it is very comprehensive.

They also provide a nice validator tool: https://validator.schema.org/

Here is the HTML, now with Microdata properties (`itemprop`, `itemscope`, and `itemtype`) added (some of the content is omitted for brevity):

```html
<html lang="en-US" itemscope itemtype="https://schema.org/ProfilePage">
	<head>
		<meta property="og:title" name="twitter:title" itemprop="name" content="Marco Campos | Senior Web Developer">
		<meta property="og:locale" itemprop="inLanguage" content="en_US">
		<meta property="og:url" itemprop="url" content="https://madcampos.dev/">
		<meta property="og:description" name="description" itemprop="headline" content="Marco Campos - Senior Web Developer - Vue.js, Node.js, TypeScript, JavaScript">
		<meta name="twitter:description" itemprop="abstract" content="Marco Campos - Senior Web Developer - Vue.js, Node.js, TypeScript, JavaScript">
		<meta property="og:image" name="twitter:image" itemprop="image" content="https://madcampos.dev/_astro/logo-micro.niOL6vSR.png">
		<meta name="keywords" itemprop="keywords" property="article:tag" content="Senior web developer, web developer, vue.js, vue, node.js, javascript, typescript, webdev">
	</head>

	<body>
		<main>
			<section id="about" itemprop="mainEntity" itemtype="https://schema.org/Person" itemscope>
				<aside>
					<picture itemprop="image" itemscope="" itemtype="https://schema.org/ImageObject">
						<img src="/_astro/me.Aph_RU_e_1ffEBR.webp" itemprop="contentUrl" alt="A picture of my face with a smile looking at the camera. I'm wearing aviator glasses, a fake fur winter hat and an orange scarf.">
					</picture>
				</aside>
				<article>
					<div itemprop="description">
						<p>
							Hi there! My name is <em itemprop="name"><span itemprop="givenName">Marco</span> <span itemprop="familyName">Campos</span></em> (<em>@</em><em itemprop="alternateName">madcampos</em> on most social networks)!
							<br>
							I'm a <span itemprop="jobTitle">Senior Web Developer</span> based in <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
								<span itemprop="addressLocality">Toronto</span>,
								<span itemprop="addressCountry">Canada</span>
							</span>.
						</p>
						<p>I have experience with both frontend and backend development, with focus on responsive and accessible design, typescript and node.js.</p>
					</div>

					<p>You can find my projects, personal work, blog and some social networks on the links below:</p>

					<ul>
						<li><a href="https://github.com/madcampos" itemprop="sameAs">GitHub</a></li>
						<li><a href="https://codepen.io/madcampos" itemprop="sameAs">CodePen</a></li>
						<li><a href="https://www.linkedin.com/in/madcampos/" itemprop="sameAs">LinkedIn</a></li>
						<li><a href="/projects">Project Highlights</a></li>
						<li><a href="/talks">Talks I've given</a></li>
						<li><a href="/blog" rel="noreferrer noopener">My Blog</a></li>
					</ul>
				</article>
			</section>
		</main>
	</body>
</html>
```

## The formats keep getting smaller

There are yet another set of formats to annotate our data, [Microformats](https://microformats.org/)! To make things even more confusing it is actually a set of evolving formats. So to tag your home page with user information it is good to add [`h-card`](https://microformats.org/wiki/h-card) data but also the deprecated yet still backwards compatible [`hCard`](https://microformats.org/wiki/hcard)

I won't add an example here as it is quite similar to Microdata in the sense that it just annotates the HTML, but with `class` names instead of a specific property. This is mostly useful for [Webmentions](https://indieweb.org/Webmention) the [IndieWeb](https://indieweb.org/).

## Search and you will find

Google has an interesting library to help you annotate the data on your page so it shows nicely in search results. Here are their docs on all the formats available: https://developers.google.com/search/docs/appearance/structured-data/search-gallery

And here is a tool to test the formats: https://search.google.com/test/rich-results

## The ignored ones

There are two other formats usually references along with the ones before: [RDFa](https://en.wikipedia.org/wiki/RDFa) and [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD).

I left them out of my markup because they are both verbose, coming from an XML era of things; and also because I have too many formats and redundant information already.

Aside from Google and Schema.org's examples I haven't seen it used anywhere, so they are out.

## Bloating my markup

In short, all this work seems to bloat the markup and make it hard to read and maintain. The advantage is it showing nicely in different platforms. And lastly the challenge is learning when to stop adding things.
