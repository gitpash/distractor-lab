import { WebHaptics } from "web-haptics";
import { hapticTrigger } from "ios-haptics";

type HapticType = "success" | "error" | "nudge";

let webHaptics: WebHaptics | null = null;
let platform: "ios" | "android" | "desktop" = "desktop";

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document)) {
    return "ios";
  }
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export function initHaptics() {
  platform = detectPlatform();
  console.log("[haptics] platform:", platform);

  if (platform === "android") {
    webHaptics = new WebHaptics();
  }
}

export function triggerHaptic(type: HapticType) {
  if (platform === "android" && webHaptics) {
    webHaptics.trigger(type);
  }
}

export function destroyHaptics() {
  webHaptics?.destroy();
  webHaptics = null;
}

export function getPlatform() {
  return platform;
}

export { hapticTrigger };
