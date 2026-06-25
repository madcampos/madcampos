const pageFindUrl = import.meta.env.DEV ? '../../../../dist/pagefind/pagefind.js?url' : '/pagefind/pagefind.js';
const pagefind = await import(pageFindUrl);

// Ref: https://pagefind.app/docs/api/
pagefind.init();
