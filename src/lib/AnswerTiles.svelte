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

    const tiles = [
        { key: "horiz", angle: 0, labelKey: "orientations.horiz" },
        { key: "diag1", angle: 45, labelKey: "orientations.diag1" },
        { key: "vert", angle: 90, labelKey: "orientations.vert" },
        { key: "diag2", angle: 135, labelKey: "orientations.diag2" },
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
        <button
            class="dpad-btn top"
            onclick={() => onAnswer("diag1")}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            <OrientationIcon angle={45} size={24} />
        </button>
        <button
            class="dpad-btn left"
            onclick={() => onAnswer("horiz")}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            <OrientationIcon angle={0} size={24} />
        </button>
        <button
            class="dpad-btn right"
            onclick={() => onAnswer("vert")}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            <OrientationIcon angle={90} size={24} />
        </button>
        <button
            class="dpad-btn bottom"
            onclick={() => onAnswer("diag2")}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            <OrientationIcon angle={135} size={24} />
        </button>
    </div>
</div>

<style>
    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
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
        display: grid;
        grid-template-columns: repeat(2, 50px);
        grid-template-rows: repeat(2, 50px);
        gap: 4px;
    }
    .dpad-btn {
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
        background: rgba(0, 229, 255, 0.15);
        border-color: var(--accent);
    }
    .top { grid-column: 1; grid-row: 1; }
    .left { grid-column: 1; grid-row: 2; }
    .right { grid-column: 2; grid-row: 1; }
    .bottom { grid-column: 2; grid-row: 2; }
</style>
