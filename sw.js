if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,t)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let r={};const c=e=>n(e,a),o={module:{uri:a},exports:r,require:c};s[a]=Promise.all(i.map((e=>o[e]||c(e)))).then((e=>(t(...e),r)))}}define(["./workbox-a5afd117"],(function(e){"use strict";e.enable(),self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-fdbfd0f0.css",revision:null},{url:"index.html",revision:"50ffa2e3845421c144d93e0c97c42ee1"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"icons/transparent/manifest-icon-192.png",revision:"54d4a318ac1905ff9a8ba2225e1f4d2c"},{url:"icons/transparent/manifest-icon-512.png",revision:"e8fd8063d47b702aabef64e86fe8382c"},{url:"icons/maskable/manifest-icon-192.png",revision:"315685ef304a4a0830a51af99d6c3d40"},{url:"icons/maskable/manifest-icon-512.png",revision:"52c0d0bf3233a23c0c440da6d89d0d39"},{url:"manifest.webmanifest",revision:"622473a8067effbd46734c6334c2ead9"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/\.(?:png|jpg|jpeg|svg)$/iu,new e.CacheFirst({cacheName:"images",plugins:[new e.ExpirationPlugin({maxEntries:100,maxAgeSeconds:31536e3}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET"),e.registerRoute(/\.(?:js|css|json|html|txt|xml)$/iu,new e.StaleWhileRevalidate({cacheName:"assets",plugins:[new e.ExpirationPlugin({maxEntries:100,maxAgeSeconds:2592e3}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));