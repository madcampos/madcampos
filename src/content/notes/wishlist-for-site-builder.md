# Wishlist for site builder

## File based routing (pages folder)

```
- pages
  - index.html -> pages/(index.html)
  - foo.html -> pages/foo.html
  - bar.ts -> pages/bar.html
  - baz.js -> pages/baz.html
```

### ts/js files

- Export a default function that is called to render the page

```typescript
declare function jsResponse(url: string, params?: Record<string, string>, data?: any): Response;
```

### html pages

- Have optional script block with `type="server"`
- Block is a module script

```typescript
declare function htmlRenderer(url: string, params?: Record<string, string>, data?: string): void;
declare function paramResolver(url: string): { url: string, params: Record<string, string>, data: any };
```

## Components folder

- Auto loaded
- Optional script block exporting `HTMLRenderedFunction`

```
- components
  - my-component.html -> <my-component></my-component>
```

## Content folder

- Markdown collections on each folder
- Helper API for querying collections
- Schema validation?
- Auto loaded?

```typescript
declare function getEntries(collectionFolder: string): MarkdownEntry[];
declare function getEntry(filePath: string): MarkdownEntry;
```
