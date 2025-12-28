---
title: Test **_MD_** & <html> content
summary: Test post with all **_markdown_** content and <html> tags
image: ./assets/test.png
imageAlt: Test <html> tag and **_markdown_** content.
imageRights: Test <html> tag and **_markdown_** content.
createdAt: 9999-12-31T23:59:59.999Z
updatedAt: 9999-12-31T23:59:59.999Z
updates:
  - date: 9999-12-31T23:59:59.999Z
    changes: Test <html> tag and **_markdown_** content.
  - date: 9999-12-31T23:59:59.999Z
    changes: Test <html> tag and **_markdown_** content.
draft: true
tags:
  - Test
  - Markdown
  - HTML
relatedPosts:
  - test
  - test
  - test
  - test
  - test
---

This is a test for markdown syntax.

## Headers

(H1 is always skipped)

## H2

### H3

#### H4

##### H5

###### H6

## Inline formatting

This is a **bold** text and this is an _italic_ text.

Here is an [internal link](#headers) and an [external link](https://example.com) and an inline `code` sample.

Here is an image:

![Alt text](./assets/test.png)

## Paragraphs

Paragraph.
With line break.

Another paragraph, followed by an horizontal line:

---

## Lists

- List item 1
- List item 2
  - Nested item
    - Deep nested

1. List item 1
2. List item 2
   1. Nested item
      1. Deep nested

## Block quote

> This is a blockquote.

## Code block

```ts
// Code block
console.log('Hello, Markdown!');

function testNesting() {
	if (true) {
		console.log('true');
	}
}
```

```ts
console.log('hewwo'); // [!code --]
console.log('hello'); // [!code ++]
console.log('goodbye');
```

```ts
console.log('Not highlighted');
console.log('Highlighted'); // [!code highlight]
console.log('Not highlighted');
```

```ts
// [!code highlight:3]
console.log('Highlighted');
console.log('Highlighted');
console.log('Not highlighted');
```

```ts
console.log('Not highlighted');
// [!code highlight:1]
console.log('Highlighted');
console.log('Not highlighted');
```

```ts
// [!code word:Hello]
const message = 'Hello World';
console.log(message); // prints Hello World
```

```ts
// [!code word:Hello:1]
const message = 'Hello World';
console.log(message); // prints Hello World
```

```ts
console.log('Not focused');
console.log('Focused'); // [!code focus]
console.log('Not focused');
```

```ts
// [!code focus:2]
console.log('Focused');
console.log('Focused');
console.log('Not focused');
```

```ts
console.log('No errors or warnings');
console.error('Error'); // [!code error]
console.warn('Warning'); // [!code warning]
```

```js {1,3-4}
console.log('1');
console.log('2');
console.log('3');
console.log('4');
```

```js /Hello/
const msg = 'Hello World';
console.log(msg);
console.log(msg); // prints Hello World
```

## Markdown Table

| Name  | Age |   Occupation |
| :---- | :-: | -----------: |
| Alice | 30  |    Developer |
| Bob   | 25  |     Designer |
| Carol | 28  | Product Lead |

## Footnotes

Here is a statement with a footnote[^1], multiple[^1] times[^1]. And another one.[^2]

[^1]: This is the first footnote.

[^2]: This is the second footnote.

## Extended markdown syntax

### Definition lists

Definition Title
:	Definition item

### Deleted and inserted text

~~Strikethrough (deleted) text~~
++Underline (inserted) text++

### Task list

- [ ] Unchecked task
- [x] Checked task

### Highlight text

This text is ==highlighted==.
=r=red highlight==

### Subscript and superscript

Examples: H~2~O and X^2^

### Auto url

http://www.example.com

## Embedded content

<baseline-info feature="anchor-positioning"></baseline-info>

<youtube-embed title="Never Gonna Give you Up - Rick Astley" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></youtube-embed>

<codepen-embed title="SVG - inline example" href="https://codepen.io/madcampos/pen/WbNQYvE"></codepen-embed>

## HTML `<dl>` Example

<dl>
	<dt>Markdown</dt>
	<dd>A lightweight markup language for formatting text.</dd>
	<dt>HTML</dt>
	<dd>The standard markup language for creating web pages.</dd>
</dl>
