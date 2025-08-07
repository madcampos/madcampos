---
title: Yes, no, maybe 🎱
createdAt: 2024-03-19T01:36:22.635-04:00
updatedAt: 2024-04-04T07:28:00.000-04:00
updates:
  - date: 2024-04-04T07:28:00.000-04:00
    changes: Added a new section about how web component have different philosophy than react.
image: ./assets/8ball.jpg
imageAlt: A close shot of a shiny billiard "8 ball" in a snow pile with northern lights in the background.
summary: A study on intermediate state checkboxes and how to handle state in react.
tags:
  - BuildingInPublic
  - BuildInTheOpen
  - coding
  - FrontendDevelopment
  - web
  - react
  - web-components
  - lit
---

The other day I was working on a problem that required [indeterminate state checkboxes](https://developer.mozilla.org/en-US/docs/Web/CSS/:indeterminate).

Now that is not something we need everyday and can be tricky to work with. But I'm here to exercise my favourite sport: **bash on react!** 🏏

## "Lifting the state up"

React's response when you have to access data from a child component is to ["lift the state up"](https://react.dev/learn/sharing-State-between-components). But that can become problematic really fast for two reasons:

1. When you lift the state up, you are basically telling react that it should re-render everything from that component down, even if there is no state change on the children and you are only _reading_ some data and not _writing_ anything[^1].
2. Your components start to become tightly coupled together or full of indirections. Instead of having the component being self contained, it _has to_ depend on the parent or expose a bunch of handlers to manipulate it and be generic.

The solution to the first problem is either using redux or signals. The second problem is not easily solvable by react...

## Web components to the rescue

This is where the mental model from web components shine. As each component is responsible for it's own state and is a [best practice](https://web.dev/articles/custom-elements-best-practices#aim-to-keep-primitive-data-attributes-and-properties-in-sync,-reflecting-from-property-to-attribute,-and-vice-versa) to expose it to the parent. You can just read the property on the HTML element and that will give you the answer, no need to couple the components or re-render anything extra.

An interesting side effect is that even if you change the child components, it will not update the parent. If you change the parent, it will not trigger re-rendering of the children.

## Redux, signals, and friends

One potential solution to the first problem is using redux. I particularly don't like redux because it adds too much complexity and boilerplate to a project. For simpler cases, it seems like trying to kill a bug with a cannon ball.

The other potential solution would be signals, but that sounds like just a _react-ism_ of [standard events](https://developer.mozilla.org/en-US/docs/Web/API/Event)[^2].

## Show & Tell

Here I'm going to give examples of the following methods:

1. [React with state lifted](https://codepen.io/madcampos/pen/PogWNXd?editors=0010)
2. [Web components with properties and custom events](https://codepen.io/madcampos/pen/MWRJmqg?editors=0010)[^3]

Aside from syntax differences and quirks from each methodology, both examples achieve the same result.

The main differences are where the source of truth is: in react it has to be on the parent "app" component and cannot be derived from reading from the children.

In the web component version however, the implementation is more flexible as the children are responsible for their own state in a self contained way. The parent "app" component only _composes_ (pun intended) from the children.

## Following the data

One thing to thank react for is the concept of data flowing only one way. In both examples we don't have two way data bindings, when something change by user interaction it is propagated up via state or via events and then back down by setting props on the children.

This is a sane way to approach the problem of data binding, what we have to keep in mind though is that all options are valid depending on the problem and _forcing_ one option as the "single universal truth" is narrow minded for ignoring all other options.

## Composability and complexity

In the examples it may seem silly and not show why web components have a better pattern than react here. I invite you to think about a similar component, but instead of having a fixed size, it can be a tree of checkboxes arbitrarily nested, like the example below:

```plain
[-] indeterminate
	[x] checked
		[x] checked
		[x] checked
	[ ] unchecked
		[ ] unchecked
		[ ] unchecked
	[-] indeterminate
		[x] checked
		[ ] unchecked
```

Using web components, the solution is to use `<slot>`s and do the same query for the children state but from the slots. A huge chunk of the logic is already implemented in a pretty generic way.

On the other hand, implementing a tree component like that using react is much more complex and leads to tight coupling of the components logic together or the centralization of all data in the root component.

## The DOM _is_ the state

Recently I had a conversation with other developers and we were talking about attributes representing state and that being reflected on the DOM.
We also spoke about how to use CSS _as a query language_ to style and pick up the elements based on those attributes/state.

Having state reflected in the DOM and letting other parts of the browser deal with this is something that is lacking in react and where web components thrive.

This fundamental idea makes logic to handle children component easier. You define a contract, that is the boundary between your component internals and the outside world. Those attributes exposed there are a way to communicate between components without a hierarchical and tightly coupled structure, and _that_ is powerful.

[^1]: React's rendering system does not have granular control on small changes and will re-render everything, even if no changes have happened, which causes performance issues. This is more pronounced on slow devices or large lists, using the `key` prop helps with lists but doesn't solve all problems.

[^2]: You can actually use [custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) _reliably_ since Internet Explorer 10 days, but react just didn't make the jump and decided to keep using it's synthetic events because _reasons_... 🤷‍♂️

[^3]: I'm using [lit](https://lit.dev) just to skip some of the custom elements boilerplate and make it _look more like_ what react devs may be used to. _BUT_, it could be implemented in plain js without much hassle.
