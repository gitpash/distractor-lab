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
            <button
                class="btn btn-horiz"
                onclick={() => onAnswer("horiz")}
                aria-label="Horizontal"
                {@attach isIOS ? hapticTrigger : undefined}
            >
                <DirIcon direction="horiz" size={32} />
            </button>
            <button
                class="btn btn-diag2"
                onclick={() => onAnswer("diag2")}
                aria-label="135 degrees"
                {@attach isIOS ? hapticTrigger : undefined}
            >
                <DirIcon direction="diag2" size={32} />
            </button>
            <div class="center" aria-hidden="true"></div>
            <button
                class="btn btn-diag1"
                onclick={() => onAnswer("diag1")}
                aria-label="45 degrees"
                {@attach isIOS ? hapticTrigger : undefined}
            >
                <DirIcon direction="diag1" size={32} />
            </button>
            <button
                class="btn btn-vert"
                onclick={() => onAnswer("vert")}
                aria-label="Vertical"
                {@attach isIOS ? hapticTrigger : undefined}
            >
                <DirIcon direction="vert" size={32} />
            </button>
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
        --tile: 52px;
        display: grid;
        grid-template-columns: repeat(3, var(--tile));
        grid-template-rows: repeat(3, var(--tile));
        gap: 8px;
    }
    .btn-horiz { grid-area: 1 / 2; }
    .btn-diag2 { grid-area: 2 / 1; }
    .btn-diag1 { grid-area: 2 / 3; }
    .btn-vert  { grid-area: 3 / 2; }
    .btn {
        width: var(--tile);
        height: var(--tile);
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
        grid-area: 2 / 2;
        width: 14px;
        height: 14px;
        place-self: center;
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
