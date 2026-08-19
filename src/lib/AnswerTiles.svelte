<script lang="ts">
    import { t } from "svelte-i18n";
    import { hapticTrigger } from "$lib/game/haptics";
    import DirIcon from "$lib/DirIcon.svelte";

    type Props = {
        onAnswer: (key: string) => void;
        onSkip: () => void;
        onRepeat: () => void;
        canRepeat: boolean;
        isIOS: boolean;
        modeType?: "4afc" | "2afc";
    };
    let { onAnswer, onSkip, onRepeat, canRepeat, isIOS, modeType = "4afc" }: Props = $props();

    const directions = [
        { key: "horiz", dir: "horiz" as const, pos: "top" },
        { key: "diag2", dir: "diag2" as const, pos: "left" },
        { key: "diag1", dir: "diag1" as const, pos: "right" },
        { key: "vert", dir: "vert" as const, pos: "bottom" },
    ];
</script>

<div class="controls">
    <div class="side-buttons">
        <button
            class="side-btn"
            onclick={onRepeat}
            disabled={!canRepeat}
            aria-label="Replay"
            {@attach isIOS ? hapticTrigger : undefined}
        >↺</button>
        <button
            class="side-btn"
            onclick={onSkip}
            aria-label="Skip"
            {@attach isIOS ? hapticTrigger : undefined}
        >⏭</button>
    </div>
    {#if modeType === "2afc"}
        <div class="two-choice">
            <button class="btn-2afc left" onclick={() => onAnswer("left")} {@attach isIOS ? hapticTrigger : undefined}>
                ◀ {$t("orientations.left")}
            </button>
            <button class="btn-2afc right" onclick={() => onAnswer("right")} {@attach isIOS ? hapticTrigger : undefined}>
                {$t("orientations.right")} ▶
            </button>
        </div>
    {:else}
        <div class="joystick">
            <div class="row">
                <span></span>
                <button class="btn" onclick={() => onAnswer("horiz")} {@attach isIOS ? hapticTrigger : undefined}>
                    <DirIcon direction="horiz" size={32} />
                </button>
                <span></span>
            </div>
            <div class="row">
                <button class="btn" onclick={() => onAnswer("diag2")} {@attach isIOS ? hapticTrigger : undefined}>
                    <DirIcon direction="diag2" size={32} />
                </button>
                <div class="center"></div>
                <button class="btn" onclick={() => onAnswer("diag1")} {@attach isIOS ? hapticTrigger : undefined}>
                    <DirIcon direction="diag1" size={32} />
                </button>
            </div>
            <div class="row">
                <span></span>
                <button class="btn" onclick={() => onAnswer("vert")} {@attach isIOS ? hapticTrigger : undefined}>
                    <DirIcon direction="vert" size={32} />
                </button>
                <span></span>
            </div>
        </div>
    {/if}
</div>

<style>
    .controls {
        display: flex;
        align-items: center;
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
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-lg);
        transition: transform var(--duration-fast) ease-out, background var(--duration-normal) ease, border-color var(--duration-normal) ease;
        font-family: inherit;
    }
    .side-btn:active {
        transform: scale(0.97);
        background: rgba(0, 229, 255, 0.1);
        border-color: var(--accent);
    }
    .side-btn:disabled {
        opacity: 0.3;
        pointer-events: none;
    }
    .joystick {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .row span {
        width: 52px;
        height: 52px;
    }
    .btn {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform var(--duration-fast) ease-out, background var(--duration-normal) ease, border-color var(--duration-normal) ease, box-shadow var(--duration-normal) ease;
        font-family: inherit;
        padding: 0;
        overflow: hidden;
    }
    .btn:active {
        transform: scale(0.97);
        background: rgba(0, 229, 255, 0.2);
        border-color: var(--accent);
        box-shadow: 0 0 12px var(--accent-glow);
    }
    .center {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
    }
    .two-choice {
        display: flex;
        gap: 12px;
    }
    .btn-2afc {
        width: 120px;
        height: 52px;
        border-radius: var(--radius);
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: var(--text-base);
        font-weight: 600;
        font-family: inherit;
        transition: transform var(--duration-fast) ease-out, background var(--duration-normal) ease, border-color var(--duration-normal) ease, box-shadow var(--duration-normal) ease;
    }
    @media (hover: hover) and (pointer: fine) {
        .btn-2afc:hover {
            border-color: var(--accent-dim);
        }
    }
    .btn-2afc:active {
        transform: scale(0.97);
        background: rgba(0, 229, 255, 0.2);
        border-color: var(--accent);
        box-shadow: 0 0 12px var(--accent-glow);
    }
</style>
