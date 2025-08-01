---
title: Tabs, Tabs, Tabs
createdAt: 2023-07-21T02:11:12.000-04:00
updatedAt: 2024-02-02T03:21:00.000-05:00
updates:
  - date: 2024-02-02T03:21:00.000-05:00
    changes: Added an image to the post.
summary: A how to guide on building an accessible tab component using Web Components.
image: ./assets/modern-day-mimic.jpg
imageAlt: 'A drawing of a mimic, a monster from the game Dungeons and Dragons, disguised as a file cabinet. The mimic has big smiling teeth and googly eyes. The folders on top of the cabinet form a "hair" for the monster.'
tags:
  - web-components
  - JavaScript
  - html
  - CSS
  - BuildInTheOpen
  - BuildingInPublic
  - BreakIntoTech
  - LearnToCode
  - FrontendDevelopment
relatedPosts:
  - web-components-basics
---

This post is a deeper dive into Web Components, with a focus on building a tab navigation that is accessible. If you are not familiar with Web Components, I recommend you read my [previous post](/blog/2023/06/web-components-basics/) on the topic.

## Accessible Tabs

As I'm not an expert in accessibility, but I do care about it, I'll be using the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/) as a reference. Particularly the [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) section.

The whole tabs are actually 3 components:

1. **The tabs container**

   It is where everything will go and the component responsible for controlling the interaction between the tabs list and the tabs panels, as well as keyboard and pointer events.
2. **The tabs list**

   It is the list of buttons that will represent each individual tab.
3. **The tabs panels**

   The actual content of each tab.

### The Tabs Panel

It is the simplest of the components, containing only an `<article>` with a `<slot>` inside where the content will go.

Here is the code:

```typescript
class CustomTabPanel extends HTMLElement {
	static get observedAttributes() {
		return ['selected', 'tab'];
	}

	declare shadowRoot: ShadowRoot;
	#internals: ElementInternals;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.#internals = this.attachInternals();

		this.#internals.role = 'tabpanel';
		this.#internals.ariaSelected = 'false';
		this.tabIndex = -1;
		this.hidden = true;

		this.shadowRoot.innerHTML = `
			<article>
				<slot></slot>
			</article>
		`;
	}

	get selected() {
		return this.#internals.ariaSelected === 'true';
	}

	set selected(value: boolean) {
		this.toggleAttribute('selected', value);
		this.#internals.ariaSelected = value ? 'true' : 'false';
		this.tabIndex = value ? 0 : -1;
		this.hidden = !value;
	}

	get tab() {
		return this.getAttribute('tab') ?? '';
	}

	set tab(value: string) {
		this.setAttribute('tab', value);
		this.setAttribute('aria-labelledby', value);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'selected':
				this.selected = newValue !== null;
				break;
			case 'tab':
				this.tab = newValue;
				break;
			default:
		}
	}
}
```

The call to `this.attachInternals()` is what makes this component accessible. It creates an [`ElementInternals`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) object that allows us to set the `role` and `aria-selected` attributes. We also set the `tabIndex` and `hidden` properties to make the panel focusable, but out of the tab order by default and hidden when not selected.

Those properties are kept in sync with the attributes using the `attributeChangedCallback` method and setting the attribute value on the property [setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set). This is done so we can set both the attribute via HTML or the property via JavaScript and both will get updated.

### The Tabs List

The tab component is very similar to the panel, the only difference is the property `panel` that associates the tab to a panel.

Here is the code:

```typescript
export class CustomTab extends HTMLElement {
	static get observedAttributes() {
		return ['selected', 'panel'];
	}

	declare shadowRoot: ShadowRoot;
	#internals: ElementInternals;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.#internals = this.attachInternals();

		this.#internals.role = 'tab';
		this.#internals.ariaSelected = 'false';
		this.tabIndex = -1;

		this.shadowRoot.innerHTML = `
			<div id="container">
				<slot></slot>
			</div>
		`;
	}

	get selected() {
		return this.#internals.ariaSelected === 'true';
	}

	set selected(value: boolean) {
		this.toggleAttribute('selected', value);
		this.#internals.ariaSelected = value ? 'true' : 'false';
		this.tabIndex = value ? 0 : -1;
	}

	get panel() {
		return this.getAttribute('panel') ?? '';
	}

	set panel(value: string) {
		this.setAttribute('panel', value);
		this.setAttribute('aria-controls', value);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'selected':
				this.selected = newValue !== null;
				break;
			case 'panel':
				this.panel = newValue;
				break;
			default:
		}
	}
}
```

### The Tabs Container

Now, here is where things start to get interesting. The container is the component that will control the interaction between the tabs list and the tabs panels. It will also ensure they all are connected.

The interactions we will be handling are:

- Keyboard navigation
  - Left and Right arrow keys
  - Home and End keys
- Focus management
- Tab assignment

Here is the full code:

```typescript
export class CustomTabs extends HTMLElement {
	static get observedAttributes() {
		return ['selected'];
	}

	declare shadowRoot: ShadowRoot;
	#internals: ElementInternals;

	#tabsSlot: HTMLSlotElement;
	#panelsSlot: HTMLSlotElement;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.#internals = this.attachInternals();

		this.#internals.role = 'tablist';
		this.#internals.ariaLabel = 'Tab Container';

		this.shadowRoot.innerHTML = `
			<div id="tab-container">
				<div id="tabs-wrapper">
					<slot name="tabs"></slot>
				</div>
				<div id="panels-wrapper">
					<slot name="panels"></slot>
				</div>
			</div>
		`;

		this.#tabsSlot = this.shadowRoot.querySelector('slot[name="tabs"]') as HTMLSlotElement;
		this.#panelsSlot = this.shadowRoot.querySelector('slot[name="panels"]') as HTMLSlotElement;

		if (!this.id) {
			this.id = `c-tabs-${Math.random().toString(36).substring(2, 12)}`;
		}
	}

	get selected() {
		return this.getAttribute('selected') ?? '';
	}

	set selected(value) {
		this.setAttribute('selected', value);

		const selectedTab = (this.#tabsSlot.assignedElements().find((tab) => tab.id === value) ?? this.#tabsSlot.assignedElements()[0]) as HTMLElement;

		this.#selectTab(selectedTab);
	}

	#associateTabs() {
		this.#tabsSlot.assignedElements().forEach((tabElement, index) => {
			const tabId = tabElement.getAttribute('id') ?? `${this.id}-tab-${index}`;

			const panel = this.#panelsSlot.assignedElements()[index] as HTMLElement;
			const panelId = panel.getAttribute('id') ?? tabElement.getAttribute('panel') ?? `${this.id}-panel-${index}`;

			tabElement.setAttribute('id', tabId);
			tabElement.setAttribute('panel', panelId);

			panel.setAttribute('id', panelId);
			panel.setAttribute('tab', tabId);
		});
	}

	#selectTab(tab: HTMLElement) {
		this.#tabsSlot.assignedElements().forEach((tabElement) => {
			tabElement.toggleAttribute('selected', tabElement.id === tab.id);
		});

		this.#panelsSlot.assignedElements().forEach((panel) => {
			panel.toggleAttribute('selected', panel.id === tab.getAttribute('panel'));
		});
	}

	connectedCallback() {
		this.#tabsSlot.addEventListener('slotchange', () => this.#associateTabs());

		this.#associateTabs();

		const selectedTab = (this.#tabsSlot.assignedElements().find((tab) => tab.id === this.selected) ?? this.#tabsSlot.assignedElements()[0]) as HTMLElement;

		this.#selectTab(selectedTab);

		this.addEventListener('focusin', (evt) => {
			const tab = (evt.target as HTMLElement).closest<HTMLElement>('c-tab');

			if (tab) {
				this.#selectTab(tab);
			}
		});

		this.addEventListener('keydown', (evt) => {
			const tab = (evt.target as HTMLElement).closest<HTMLElement>('c-tab');

			if (tab) {
				const tabs = this.#tabsSlot.assignedElements() as HTMLElement[];

				const index = tabs.indexOf(tab);

				switch (evt.key) {
					case 'ArrowLeft':
						tabs[(index - 1 + tabs.length) % tabs.length].focus();
						break;
					case 'ArrowRight':
						tabs[(index + 1) % tabs.length].focus();
						break;
					case 'Home':
						tabs[0].focus();
						break;
					case 'End':
						tabs[tabs.length - 1].focus();
						break;
					default:
				}
			}
		});
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'selected':
				this.selected = newValue;
				break;
			default:
		}
	}
}
```

Let's break down the code.

1. The `constructor` is pretty straightforward, we set the `role` and `aria-label` attributes, create the HTML structure, keep references of the slots. We also generate an id if one is not provided.
2. The `selected` property is used to keep track of the selected tab. It is also used to set the initial selected tab. It's setter will also find the selected tab and call the `#selectTab` method to update the selected tab.
3. The `#associateTabs` method is used to associate the tabs with the panels. It will also generate an id for the tab and panel if one is not provided. We do this based on the tabs instead of panels because tabs will be interactive where panels are hidden by default and can be "orphans".
4. The `#selectTab` method is used to update the selected tab and panel based on the tab element passed as argument.
5. The `connectedCallback` is where we set up the event listeners.
   - We listen to the `slotchange` event on the tabs slot to call the `#associateTabs` method and update all tabs and panels. This event is fired every time the content of the `<slot>` changes.
   - The `#associateTabs` method is called once to update all tabs and panels when the component is first inserted on the page.
   - Next, we find the `selected` tab, if there is one, or set it to be the first one on the list.
   - Finally, we set up the keyboard navigation and focus management. More on that below.

### (Keyboard) Navigation

The navigation may seem weird as there are no `click` or `touch` event listeners, but that will make sense in a bit.

When we first move focus to the tab, it will go to the currently selected tab, as all others are out of the tab order. This happens when we press `tab` until we reach the component or when we click the tab. That is where the `focusin` event comes in, it will make the tab that _received focus_ be selected, thus triggering the `#selectTab` method and updating the selected tab and panel.

The keyboard navigation is handled by the `keydown` event listener. It will filter the event and only handle the arrow keys, home and end; on each case there is some math involved to find the index of the tab that needs to be focused and then call the `focus` method on it.

## Demo

You can check out the full code on CodePen: https://codepen.io/madcampos/pen/NWEzogQ

::codepen[Tabs Web Component]{#NWEzogQ username=madcampos}
