// oxlint-disable no-magic-numbers
import { SiteSettings } from '../../assets/js/settings.ts';

declare global {
	interface LayoutShiftAttribution {
		node: Node;
		previousRect: DOMRectReadOnly;
		currentRect: DOMRectReadOnly;
	}

	interface LayoutShift extends PerformanceEntry {
		entryType: 'layout-shift';
		value: number;
		hadRecentInput: boolean;
		lastInputType: DOMHighResTimeStamp;
		sources: readonly LayoutShiftAttribution[];
	}
}

// oxlint-disable-next-line vars-on-top no-var no-shadow
declare var LayoutShift: {
	prototype: LayoutShift,
	new (): LayoutShift
};

interface LongTask {
	startTime: number;
	duration: number;
}

export class PageStats extends HTMLElement implements CustomElement {
	readonly #PREVIOUS_SHIFT_GAP_MS = 1000;
	readonly #LAYOUT_SHIFT_THRESHOLD_MS = 5000;

	#observers = new Set<PerformanceObserver>();
	#firstContentfulPaint = 0;
	#largestContentfulPaint = 0;
	#layoutShifts = new Map<string, Pick<LayoutShift, 'startTime' | 'value'>>();
	#interactions = new Map<number, number>();
	#longTasks = new Map<string, LongTask>();

	#addPerformanceObserver(options: PerformanceObserverInit, callback: PerformanceObserverCallback) {
		if (!PerformanceObserver.supportedEntryTypes.includes(options.type ?? '')) {
			return;
		}

		const observer = new PerformanceObserver(callback);

		observer.observe(options);
		this.#observers.add(observer);
	}

	#observeFirstContentfulPaint() {
		const options: PerformanceObserverInit = { type: 'paint', buffered: true };
		const callback: PerformanceObserverCallback = ({ getEntries }) => {
			const fcp = getEntries().find(({ name }) => name === 'first-contentful-paint');

			if (fcp) {
				this.#firstContentfulPaint = fcp.startTime;
			}
		};

		this.#addPerformanceObserver(options, callback);
	}

	#observeLargestContentfulPaint() {
		const options: PerformanceObserverInit = { type: 'largest-contentful-paint', buffered: true };
		const callback: PerformanceObserverCallback = ({ getEntries }) => {
			const lcp = getEntries().at(-1);

			if (lcp) {
				this.#largestContentfulPaint = lcp.startTime;
			}
		};

		this.#addPerformanceObserver(options, callback);
	}

	#observeLayoutShift() {
		const options: PerformanceObserverInit = { type: 'layout-shift', buffered: true };
		const callback: PerformanceObserverCallback = ({ getEntries }) => {
			const entries = getEntries().filter((entry) => entry instanceof LayoutShift);
			for (const entry of entries) {
				this.#layoutShifts.set(`${entry.startTime}:${entry.value}`, {
					startTime: entry.startTime,
					value: entry.value
				});
			}
		};

		this.#addPerformanceObserver(options, callback);
	}

	#observeInteraction() {
		const options: PerformanceObserverInit & { durationThreshold: number } = {
			type: 'event',
			buffered: true,
			durationThreshold: 16
		};
		const callback: PerformanceObserverCallback = ({ getEntries }) => {
			const entries = getEntries().filter((entry) => entry instanceof PerformanceEventTiming);
			for (const entry of entries) {
				this.#interactions.set(
					entry.interactionId,
					Math.max(this.#interactions.get(entry.interactionId) ?? 0, entry.duration)
				);
			}
		};

		this.#addPerformanceObserver(options, callback);
	}

	#observeLongTasks() {
		const options: PerformanceObserverInit = { type: 'longtask', buffered: true };
		const callback: PerformanceObserverCallback = ({ getEntries }) => {
			for (const { startTime, duration } of getEntries()) {
				this.#longTasks.set(`${startTime}:${duration}`, { startTime, duration });
			}
		};

		this.#addPerformanceObserver(options, callback);
	}

	#getCumulativeLayoutShift() {
		const shifts = [...this.#layoutShifts.values()].sort((first, second) => first.startTime - second.startTime);
		let maxSessionValue = 0;
		let sessionValue = 0;
		let sessionStart: number | undefined = undefined;
		let previousShiftTime = 0;

		for (const shift of shifts) {
			sessionStart ??= shift.startTime;

			const hasMoreThanPrevShiftGap = shift.startTime - previousShiftTime > this.#PREVIOUS_SHIFT_GAP_MS;
			const isOverThresholdFromStart = shift.startTime - sessionStart > this.#LAYOUT_SHIFT_THRESHOLD_MS;

			if (hasMoreThanPrevShiftGap || isOverThresholdFromStart) {
				sessionValue = shift.value;
			} else {
				sessionValue += shift.value;
			}

			maxSessionValue = Math.max(maxSessionValue, sessionValue);
			previousShiftTime = shift.startTime;
		}

		return maxSessionValue;
	}

	#getTotalBlockingTime(startTime: number, endTime: number) {
		return [...this.#longTasks.values()].reduce((total, task) => {
			if (task.startTime < startTime || task.startTime >= endTime) {
				return total;
			}

			return total + Math.max(0, task.duration - 50);
		}, 0);
	}

	#getNavigationTiming() {
		const navigationTiming = performance.getEntriesByType('navigation').find((perf) => perf instanceof PerformanceNavigationTiming);

		return navigationTiming ?? {
			loadEventEnd: 0,
			responseStart: 0,
			startTime: 0
		} satisfies Pick<PerformanceNavigationTiming, 'startTime' | 'loadEventEnd' | 'responseStart'>;
	}

	getMetrics() {
		const navigationTiming = this.#getNavigationTiming();
		const interactions = [...this.#interactions.values()].sort((first, second) => second - first);
		const blockingEnd = navigationTiming.loadEventEnd;

		return {
			firstContentfulPaint: this.#firstContentfulPaint,
			largestContentfulPaint: this.#largestContentfulPaint,
			cumulativeLayoutShift: this.#getCumulativeLayoutShift(),
			interactionToNextPaint: interactions[Math.floor(interactions.length / 50)],
			timeToFirstByte: navigationTiming.responseStart - navigationTiming.startTime,
			load: navigationTiming.loadEventEnd - navigationTiming.startTime,
			totalBlockingTime: this.#getTotalBlockingTime(this.#firstContentfulPaint, blockingEnd)
		};
	}

	connectedCallback() {
		if (typeof PerformanceObserver === 'undefined') {
			return;
		}

		this.#observeFirstContentfulPaint();
		this.#observeLargestContentfulPaint();
		this.#observeLayoutShift();
		this.#observeInteraction();
		this.#observeLongTasks();
	}

	disconnectedCallback() {
		this.#observers.forEach((observer) => observer.disconnect());
		this.#observers.clear();
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('page-stats')) {
	customElements.define('page-stats', PageStats);
}
