declare module "web-haptics" {
	export class WebHaptics {
		constructor(options?: { debug?: boolean; showSwitch?: boolean });
		trigger(input?: string | number | number[] | { duration: number; intensity?: number; delay?: number }[]): Promise<void>;
		cancel(): void;
		destroy(): void;
		static isSupported: boolean;
	}
}

declare module "ios-haptics" {
	export function hapticTrigger(element: HTMLElement | undefined | null): void;
}
