---
title: Noriture
status: ongoing
createdAt: 2022-08-08
updatedAt: 2024-01-20
version: 0.1.0
image: ./assets/40-noriture.png
imageAlt: An orange circle representing an orange slice with 4 segments, with the top right one being 3 curved lines representing the RSS symbol.
themeImages:
  y2k: ./assets/y2k/40-noriture.jpg
techStack:
  - GitHub Pages
  - Hono
  - IndexedDB
  - JavaScript
  - PWA
  - Vite
  - Vue
repository: https://github.com/madcampos/noriture/
---

This project is a prototype RSS feed reader. It uses [Vue](https://vuejs.org/) for the frontend and [Hono](https://hono.dev) for the backend.

The frontend includes a parser for extracting the feed metadata and the articles and make them available for consumption. Metadata for the feed is extracted using numerous sources like favicons, web app manifest, or browser specific icons.

The frontend uses indexedDB to store the articles and the metadata. It also uses the [Vite](https://vitejs.dev/) build tool to generate the final assets.

The backend server works as a simple reverse proxy to allow loading the feed XML files and bypass CORS issues.
