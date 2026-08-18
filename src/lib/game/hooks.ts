// ── Shared Svelte 5 Hooks ─────────────────────────────────────────────
// Lifecycle hooks that replace duplicated onMount patterns across pages.

import { onMount } from "svelte";
import { initHaptics, destroyHaptics } from "./haptics";

/**
 * Initializes haptics on mount and cleans up on unmount.
 * Replaces the 3 identical onMount blocks across route pages.
 */
export function useHaptics() {
    onMount(() => {
        initHaptics();
        return () => destroyHaptics();
    });
}

/**
 * Manages setTimeout/setInterval/animationFrame timers with automatic cleanup.
 * Replaces the duplicated clearTimers + loopTimeout patterns across pages.
 *
 * Usage:
 *   const timers = useGameTimers();
 *   timers.setLoopTimeout(() => { ... }, 500);
 *   timers.clearTimers(); // cleans up everything
 */
export function useGameTimers() {
    let loopTimeout: ReturnType<typeof setTimeout> | null = null;
    let resumeInterval: ReturnType<typeof setInterval> | null = null;
    let animFrameId = 0;

    function clearTimers() {
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }
        if (resumeInterval) {
            clearInterval(resumeInterval);
            resumeInterval = null;
        }
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = 0;
        }
    }

    function setLoopTimeout(fn: () => void, ms: number) {
        loopTimeout = setTimeout(fn, ms);
    }

    function setResumeInterval(fn: () => void, ms: number) {
        resumeInterval = setInterval(fn, ms);
    }

    function setAnimFrame(fn: () => void) {
        animFrameId = requestAnimationFrame(fn);
    }

    return {
        get loopTimeout() { return loopTimeout; },
        get resumeInterval() { return resumeInterval; },
        clearTimers,
        setLoopTimeout,
        setResumeInterval,
        setAnimFrame,
    };
}
