const pageFindUrl = import.meta.env.DEV ? '../../../../dist/pagefind/pagefind.js?url' : '/pagefind/pagefind.js';
const pagefind = await import(pageFindUrl);

pagefind.init();
