---
title: Shadowrun Catalog
createdAt: 2018-02-26
status: ongoing
version: 2.0.0
repository: https://github.com/madcampos/sdrlog/
url: https://sdrlog.madcampos.dev/
image: ./assets/05-sdrlog.png
imageAlt: Shadowrun's logo in a hot pink color with glitch effects applied to it on a dark gray background.
themeImages:
  y2k: ./assets/y2k/05-sdrlog.jpg
  hacker: ./assets/hacker/05-sdrlog.png
techStack:
  - HTML
  - CSS
  - JavaScript
  - PWA
  - Service Worker
  - IndexedDB
  - Web App Manifest
  - GitHub Pages
  - Web Components
  - lit-html
  - Web Assembly
---

A PWA for maintaining a library of content released for [Shadowrun](https://en.wikipedia.org/wiki/Shadowrun).

It is a study on how to create an interactive app using only web technologies that can run completely offline.

The app provides deep integration with the user's operation system by reading folder with the listed items and linking to them.

There is also code to update the local database and export the new items so it can be merged into the main database afterwards. This exporting includes optimized images for the items, using an in-browser Web Assembly library.
