/// <reference path="../.astro/types.d.ts" />

declare module '*.astro' {
	import type { AstroComponentFactory } from 'astro/runtime/server';
	const component: AstroComponentFactory;
	export default component;
}
