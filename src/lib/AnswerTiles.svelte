<script lang="ts">
    import { t } from "svelte-i18n";
    import { hapticTrigger } from "$lib/game/haptics";
    import OrientationIcon from "$lib/OrientationIcon.svelte";

    type Props = {
        onAnswer: (key: string) => void;
        onSkip: () => void;
        onRepeat: () => void;
        canRepeat: boolean;
        isIOS: boolean;
    };
    let { onAnswer, onSkip, onRepeat, canRepeat, isIOS }: Props = $props();

    const directions = [
        { key: "horiz", angle: 0, pos: "top", labelKey: "orientations.horiz" },
        { key: "diag2", angle: 135, pos: "left", labelKey: "orientations.diag2" },
        { key: "diag1", angle: 45, pos: "right", labelKey: "orientations.diag1" },
        { key: "vert", angle: 90, pos: "bottom", labelKey: "orientations.vert" },
    ];
</script>

<div class="controls">
    <div class="side-buttons">
        <button
            class="side-btn repeat"
            onclick={onRepeat}
            disabled={!canRepeat}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            ↺
        </button>
        <button
            class="side-btn skip"
            onclick={onSkip}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            ⏭
        </button>
    </div>
    <div class="dpad">
        {#each directions as d}
            <button
                class="dpad-btn {d.pos}"
                onclick={() => onAnswer(d.key)}
                {@attach isIOS ? hapticTrigger : undefined}
                aria-label={$t(d.labelKey)}
            >
                <OrientationIcon angle={d.angle} size={20} />
            </button>
        {/each}
        <div class="dpad-center"></div>
    </div>
</div>

<style>
    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 8px;
        padding-bottom: env(safe-area-inset-bottom, 0);
    }
    .side-buttons {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .side-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.1s;
        font-family: inherit;
    }
    .side-btn:active {
        transform: scale(0.9);
        background: rgba(0, 229, 255, 0.1);
        border-color: var(--accent);
    }
    .side-btn:disabled {
        opacity: 0.3;
        pointer-events: none;
    }
    .side-btn.skip {
        color: var(--text-muted);
        font-size: 14px;
    }
    .side-btn.repeat {
        color: var(--accent);
    }
    .dpad {
        position: relative;
        width: 120px;
        height: 120px;
    }
    .dpad-btn {
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        color: var(--accent);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.1s;
        font-family: inherit;
        padding: 0;
    }
    .dpad-btn:active {
        transform: scale(0.9);
        background: rgba(0, 229, 255, 0.2);
        border-color: var(--accent);
        box-shadow: 0 0 12px var(--accent-glow);
    }
    .top { top: 0; left: 50%; transform: translateX(-50%); }
    .bottom { bottom: 0; left: 50%; transform: translateX(-50%); }
    .left { left: 0; top: 50%; transform: translateY(-50%); }
    .right { right: 0; top: 50%; transform: translateY(-50%); }
    .dpad-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
    }
</style>
