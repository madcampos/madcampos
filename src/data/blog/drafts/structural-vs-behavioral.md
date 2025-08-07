---
title: Structural vs Behavioral components
summary: Two different, but complimentary points of view for components and how they should work.
createdAt: 2024-10-17T17:04:09.966-04:00
draft: true
tags:
  - WebDevelopment
  - Components
  - React
---

Since working with web components more and more, and getting to understand better the `<slot>` element, I came to appreciate it. Using slots allow us to create purely structural components.

## Debating components _ad nauseum_

There is a lot of posts going on about web components, you may love them, hate them, or be somewhere in between. There is a post for you.

The ideas on [this post](https://www.baldurbjarnason.com/2024/liskovs-gun/) resonate with me, so I won't go over that again. If you don't like web components and want to keep using react that is fine.

## Behavioral components

We are used, from frameworks like react, to think a component is a piece of reusable code that has some behavior attached to it. Think something like an accordion, it has _actions_ and _states_ attached to it.

An accordion can be made `open` or `!open`, you do that with event handlers to a part of this component, usually exposed through a `openHandler` function or similar.

This is what we, as users of a component may see:

```jsx
<Accordion isOpen, openHandler={() => {}}>
  ...
</Accordion>
```
