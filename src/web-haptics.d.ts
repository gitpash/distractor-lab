declare module "web-haptics" {
	export class WebHaptics {
		constructor(options?: { debug?: boolean; showSwitch?: boolean });
		trigger(input?: string | number | number[] | { duration: number; intensity?: number; delay?: number }[], options?: { intensity?: number }): Promise<void>;
		cancel(): void;
		destroy(): void;
		setDebug(debug: boolean): void;
		setShowSwitch(show: boolean): void;
		static isSupported: boolean;
	}
}

declare module "web-haptics/svelte" {
	export function createWebHaptics(options?: { debug?: boolean; showSwitch?: boolean }): {
		trigger: (input?: string | number | number[] | { duration: number; intensity?: number; delay?: number }[]) => Promise<void>;
		cancel: () => void;
		destroy: () => void;
	};
}
