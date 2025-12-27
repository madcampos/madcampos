---
title: "Structural vs Behavioral components: or how I stopped worrying and made found structure in all this madness"
summary: Two different, but complimentary, ways of viewing components in web development, plus some patterns to organize them.
createdAt: 2024-10-17T17:04:09.966-04:00
draft: true
tags:
  - WebDevelopment
  - Components
  - React
---

So... this post has been in the backburner for a while. The main concepts behind it have been in my mind for a long time. But [an article I read recently](https://gomakethings.com/no-seriously-the-shadow-dom-sucks/), and it's related notes made all pieces get in place.

Now, that is what I would call a hot take, it is spicy, it is furious, it is filled with primordial rage. Just the way mom used to make 'em!

Following the ~~links~~ [rabbit hole](https://gomakethings.com/death-to-the-shadow-dom/), we understand why:

> The idea that this is a general benefit is a result of React-thinking and anti-CSS tendencies among the modern frontend community.
>
> Because what it means in reality is that you cannot load a global stylesheet and let your web component inherit those styles. Your CSS must be loaded into the shadow DOM. Any global styles you want need to be replicated in the component stylesheet.
>
> You lose out on the [many wonderful benefits of the cascade](https://gomakethings.com/guides/css-selectors/cascade/) (the _C_ in _CSS_).

At that moment it clicked. Yes, it is cool to encapsulate your component and DOM but do I really need it? Do I really _want_ it?

Short answer: most of the time, no. I want my components to be cohesive and inherit from a global style, the "C" in "CSS" stands for _cascade_ after all, let's not fight it and instead embrace the damn thing.

## Two components, two solutions

So, this is the core concept behind this whole thing: most components we write have no intrinsic behaviours to them, they serve only to organize the code for the developer. Only a small handful of components create what people those days call "state", or what I call "behaviours".

## Structural components

Let's start from the most common, what I call "structural components". The name comes from the idea that they only offer _structure_ to the application[^1]. By structure it means either:

- For the developer's sake, by giving a DOM sub-tree a more memorable name.
- For the developer's sake, by giving a container you can encapsulate things.

### Memorable names

In the first case, the more memorable name is when you usually say things like: "okay, this `<header>` and it's contents need to be extracted into another file, so I will call it `PageHeader.jsx.ts`."

It is just a tool for you, the developer, to manage complexity, because truth be told, repeating yourself more than 3 times is annoying and error prone.
Also because a humongous html is horrible to work with.
And, the cherry on top, because react says so, or else your application will be even slower than it already is[^2].

### Encapsulation

The second case overlaps with the first one, but not entirely. It ties more to CSS and how we "chunk" our code into organizational parts. The question here is: "what constitutes a `PageHeader`?"

This is usually tied to a specific structure, some CSS, and a design system. It is more holistic than the previous one, but guides the memorable name because you already have a "logic unit" from the design system, so it is just easier to follow that to the logic conclusion and have a file with the same name of the design system pattern, `PageHeader` in this case.

### The context

The interesting thing here is that I haven't mentioned any "state" here, the component by itself only prescribes the shape of things, where things should be laid out and maybe some specific styles.

To add some concrete code, imagine your `PageHeader` file has this html code[^3]:

```html
<header>
	<hgroup>
		<h1>Page title</h1>
		<hr />
		<p>Some subtitle</p>
	</hgroup>
</header>
```

Nothing too complex so far, but it is static and not reusable, we want to add _slots_ for the title and the subtitle (foreshadowing).

In react land, both title and subtitle are props, or if you want to give a little bit more control, one of them would be a prop, and the rest would be the `children` prop. It is cool that react props can be literally anything, including other JSX, but that just feels _weird_... It is not HTML-y, it needs some extra processing.

Moving to web components land, the solution would be to create a new component, and add slots. So, _at minimum_ we need this JS code:

```javascript
if (!customElements.get('page-header')) {
	customElements.define(
		'page-header',
		class extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
			}

			connectedCallback() {
				this.shadowRoot.innerHTML = `
				<header>
					<hgroup>
						<h1><slot name="title"></slot></h1>
						<hr />
						<p><slot name="subtitle"></slot></p>
					</hgroup>
				</header>
			`;
			}
		}
	);
}
```

That is a lot of boilerplate, and it doesn't get better, at all. The JS API for web components is really powerful, but very verbose and annoying to work with.
For now, put a pin on it, and we will get back to that on the behavioural components part.

For now, we can simplify this with [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom).

<baseline-info feature="declarative-shadow-dom">[Declarative Shadow DOM baseline info]</baseline-info>

Really cool and definitely less verbose, plus it is HTML, it is declarative:

```html
<page-header>
	<!-- The shadow DOM -->
	<template shadowrootmode="open">
		<header>
			<hgroup>
				<h1><slot name="title"></slot></h1>
				<hr />
				<p><slot name="subtitle"></slot></p>
			</hgroup>
		</header>
	</template>

	<!-- The contents -->
	<span slot="title">Page Title</span>
	<span slot="subtitle">Some subtitle</span>
</page-header>
```

This is mildly better. Yes, it is declarative, so nicer and easier to write, there is less boilerplate and such, but it still has the same problem of the other web component and adds a new one.

### The problems (and solutions)

So, the first problem, which I omitted so far, is that by using the Shadow DOM it actually creates _an entire new document, in a clean slate_. That means we effectively lose all of our CSS in a very subtle and annoying way.

What I mean is: yes, we want to avoid CSS to spill from one component to the other, but we want some CSS to actually be shared.
We may not want the colour of paragraphs to be shared, but we do want the font family and sizes to follow a global style. Inside the Shadow DOM it is an all or nothing, we lose _everything_!

The loss of styling comes with only a marginal gain. Yes, about 10 years ago that would be a huge deal, we didn't have all of the cool new CSS features we have today to organize styles so we had to get creative and use things like [BEM](https://getbem.com/) and [SMACSS](https://smacss.com/).

Nowadays we have very good support for things like:

- [Cascade layers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers)
- [Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting)
- [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)
- [`:has`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)

<baseline-info feature="cascade-layers">[Cascade Layers baseline info]</baseline-info>
<baseline-info feature="nesting">[CSS Nesting baseline info]</baseline-info>
<baseline-info feature="scope">[@scope baseline info]</baseline-info>
<baseline-info feature="has">[:has baseline info]</baseline-info>
<baseline-info feature="container-queries">[Container queries baseline info]</baseline-info>

All of those things help to simplify the CSS we write and organize it in a way that gives more control over the cascade, it helps us scope things to a specific element in an easier way.
We basically have our cake and eat it too, no Shadow DOM, no complex arbitrary rules to follow.

## Behavioral components

That brings us to more complex components, ones that need JS to provide functionality. Interestingly enough, those may still not need to use the Shadow DOM.

With nice things like the [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) element, the [`popover`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) attribute, [custom select elements](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select), and some [CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/accent-color), the number of things we absolutely need JS to get done is _shifting_. That means we can get the basic things done without JS and only resort to it when we want to enhance the experience, build something really complex, of fill in a gap that still exists in the platform.

I think that for most interactive experiences, we don't need JS at all, or need very little of it, targeted to a few element queries and just sprinkling in the needed functionality.

For the previous example of a page header component, we don't need _any_ scripting, that can be statically built. The content of the component may change a little, but let's be honest, it mostly _doesn't_! If I load the same page, I will get the same header. Large parts of an application will not change.

When things change, there are three kinds of patterns I often see:

- Lists iterations (with some basic conditionals)
- Buttons and forms
- Super complex things that are hard regardless

### Lists and loops

Dealing with lists is easy: statically build, job's done.

If you absolutely can't statically build, then have a mostly static page and only update the list itself. Add a custom element like `<render-list-here>` and query for that.

Your script can be as easy as this:

```javascript
const listElement = document.querySelector('render-list-here');

async function renderListElements() {
	const responseFromApi = await fetch('/api/list');
	const listJson = await responseFromApi.json();

	const elements = [];

	for (const item of listJson) {
		elements.push(`
			<li>${item}</li>
		`);
	}

	return elements.join('\n');
}

listElement.innerHTML = `
	<ul>
		${await renderListElements()}
	</ul>
`;
```

So yeah... about 20 lines of code, no build step, you can use [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch), you can use [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) code, [top level await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await) is available, it is readable, tooling for [template strings with HTML](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin) is available to make life even easier.

Ah yes, the code looks similar to JSX, but it works in your browser with no extra libraries nor overhead!

✨MAGIC ✨

![A GIF of a guy in a pink unicorn t-shirt. He is wiggling his fingers down and saying "magic", while the word also appears written with rainbow sparkles.](./assets/magic.gif)

### Buttons and forms

Some things are just hard and impossible to do with HTML and CSS alone. From my experience, about 80% of the time, it boils down to the cases of "when a user press this button something will happen" or "when a user interacts with this form fields something will happen".

For both cases, you can use similar approaches to the one for rendering a list: query the element, and do something with it. I hear you that forms are complex and form validation is the bane of every developers existence.

Some of the problems with forms can be solved with CSS, yes, you still may need JS to add custom validation to whatever format postal codes are in the country you are. But the way you _present_ these errors can be delegated mostly to HTML and CSS. Use the [input attributes for validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes) and the awesome [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:user-invalid) CSS property.

Yes, forms are hard, but some of the problems have good patterns on how to deal with them, use those patterns and test things out to see what works and what doesn't for your specific problem.
Throwing a library at the problem will usually not solve your design problems, it most probably will make them worse.

### Super complex things

First off: avoid complex interactions, they are complex and hard for a reason.

Yes, getting tabs right is freaking hard. [I've tried](/blog/2023/07/tabs-web-component/), and it took a while to make things work. Adding web components on top of that doesn't really help much... In fact it makes things worse (and react would make things even worse there[^4]).

So always try to use HTML first, compose it if needed, and only then add more complex things if none of them solve your problem.

In the worst case scenario that you need to implement something super complex, like tabs, then you should keep your component to a minimum. Think in terms of slots: "what are the largest possible holes I can leave to put things in?"

Thinking in terms of slots will make your components as thin as possible, thus needing the least amount of styles as possible and mostly avoiding the issue with the Shadow DOM encapsulation.

## Putting it all together

The following steps are a hierarchy. The first one should be the bulk of the code for an application, and the last one should be just one or two components, at most.

Here is what it looks like:

1. Statically build as much as possible.
2. Use custom element tags as boundaries for the logical components.
3. Only extract components to their own files if really needed.
4. Use CSS layers to organize the cascade and give precedence to things.
5. Use nesting to make my life easier.
6. Add Declarative Shadow DOM if I really need encapsulation and it cannot be solved with CSS layers.
7. Add JS functionality to regular elements using `querySelector` and friends.
8. Add JS functionality to custom elements, if needed.
9. Add complex functionality through JS Custom Elements _without_ a Shadow DOM.
10. Add complex functionality to Shadow DOM.

My tool of choice for statically building things is currently [Astro](https://astro.build). It gets the job done, but is not without criticism, I wish it were more focused on standards and less on JSX with extra "weird" syntax.
The file build time script fenced in `---` is very odd to me. I'd rather have a syntax similar to [Vue](https://vuejs.org/) in the sense that it have syntax closer to HTML.

That being said, Astro gives me the building tools needed to encapsulate my components in a way that solves the structural component problems. I get nice files to organize my components, but most of them doesn't contain any JS. I can still use slots to insert dynamic content where needed.
It also solves the list iteration problem by providing JSX syntax and props to the components, so I _can_ use it if needed, but I don't _need_ to.

Along with statically building things, I also use custom tags to create what I need and CSS layers for organizing everything, so my component CSS would look like this:

```css
@layer components {
	page-header {
		hr { width: 5rem; }

		/* other elements inside the custom component */
	}
}
```

This kind of organization makes me have control over the components for styling and structure purposes and flexibility to use them virtually anywhere.

Then comes the question: should I extract this component to a different file?
It is important here to recognize if the component is being used only for providing some layout, and the contents inside of it change every time, than it has the same effect as using a `<div>` but with better semantics and searchability.
But some times components grow large in code and it is easier to just move that to another file.

Lastly comes the question if a component needs interactivity, that is usually obvious, and so attaching JS to it can become easy when needed, sprinkled on top, not the main driver.

[^1]: I'm using "application" instead of "page" here because it is all HTML in the end, so there is no point in making a distinction. Plus, the cult of react made people very touchy about their fancy pages being called "applications".

[^2]: Nothing wrong with thinking about performance, but it should be an optimization and not a constraint on how to write code. React makes react's problems your problem.

[^3]: Please note, this code _is_ plain HTML, this can be used by any framework or tool, albeit react is f-ing anal retentive about it and will complain. A HELL OF A F-ING LOT. (The curse words are necessary to convey my utter annoyance with the dumpster fire it is react)

[^4]: Accessibility in react is literally garbage, specifically keeping track of focused elements. Implementing a "roving focus" pattern in react requires you to break off of react's control over the DOM and rendering by using `ref`s and manipulate the DOM yourself, totally defeating the use of react. In fact, react gets in the way a lot because it really wants to control the rendering for you, so you are fighting react all the way down and overengineering something to get around react.
