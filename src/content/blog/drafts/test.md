---
title: Test **MD** & <html>
summary: Test post with all **markdown** content and <html> tags
image: ./assets/test.jpg
imageAlt: Test <html> tag
createdAt: 9999-12-31T23:59:59.999Z
draft: true
tags:
  - Test
  - Markdown
  - HTML
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

Here is a [link](https://example.com) and an inline `code` sample.

Here is an image:

![Alt text](./assets/test.jpg)

## Paragraphs

Paragraph.
With line break.

Another paragraph, followd by an horizontal line:

---

## Lists

- List item 1
- List item 2
  - Nested item

1. List item 1
2. List item 2

## Block quote

> This is a blockquote.

## Code block

```js
// Code block
console.log('Hello, Markdown!');
```

## Markdown Table

| Name  | Age |   Occupation |
| :---- | :-: | -----------: |
| Alice | 30  |    Developer |
| Bob   | 25  |     Designer |
| Carol | 28  | Product Lead |

## Footnotes

Here is a statement with a footnote.[^1] And another one.[^2]

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

::baseline[Anchor Positioning]{#anchor-positioning}

::youtube[Never Gonna Give you Up - Rick Astley]{#dQw4w9WgXcQ}

::codepen[SVG - inline example]{#WbNQYvE username=madcampos}

## HTML `<dl>` Example

<dl>
	<dt>Markdown</dt>
	<dd>A lightweight markup language for formatting text.</dd>
	<dt>HTML</dt>
	<dd>The standard markup language for creating web pages.</dd>
</dl>
