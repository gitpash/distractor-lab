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
</script>

<div class="controls">
    <div class="side-buttons">
        <button
            class="side-btn"
            onclick={onRepeat}
            disabled={!canRepeat}
            {@attach isIOS ? hapticTrigger : undefined}
        >↺</button>
        <button
            class="side-btn"
            onclick={onSkip}
            {@attach isIOS ? hapticTrigger : undefined}
        >⏭</button>
    </div>
    <div class="joystick">
        <div class="row">
            <span></span>
            <button class="btn" onclick={() => onAnswer("horiz")} {@attach isIOS ? hapticTrigger : undefined}>
                <OrientationIcon angle={0} size={18} />
            </button>
            <span></span>
        </div>
        <div class="row">
            <button class="btn" onclick={() => onAnswer("diag1")} {@attach isIOS ? hapticTrigger : undefined}>
                <OrientationIcon angle={45} size={18} />
            </button>
            <div class="center"></div>
            <button class="btn" onclick={() => onAnswer("diag2")} {@attach isIOS ? hapticTrigger : undefined}>
                <OrientationIcon angle={135} size={18} />
            </button>
        </div>
        <div class="row">
            <span></span>
            <button class="btn" onclick={() => onAnswer("vert")} {@attach isIOS ? hapticTrigger : undefined}>
                <OrientationIcon angle={90} size={18} />
            </button>
            <span></span>
        </div>
    </div>
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
        width: 44px;
        height: 44px;
    }
    .btn {
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
    .btn:active {
        transform: scale(0.9);
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
</style>
