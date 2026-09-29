interface PreferenceObject<TValue extends string> {
	readonly override: null | TValue;
	readonly value: TValue;
	readonly validValues: Readonly<TValue>;
	clearOverride(): void;
	requestOverride(value: TValue): Promise<void>;
}

interface PreferenceManager {
	colorScheme: PreferenceObject<'light' | 'dark'>;
	contrast: PreferenceObject<'more' | 'less' | 'no-preference'>;
	reducedData: PreferenceObject<'reduce' | 'no-preference'>;
	reducedMotion: PreferenceObject<'reduce' | 'no-preference'>;
	reducedTransparency: PreferenceObject<'reduce' | 'no-preference'>;
}

interface Navigator {
	preferences: PreferenceManager;
}
