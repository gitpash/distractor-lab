<script lang="ts">
    import { t } from "svelte-i18n";
    import { hapticTrigger } from "$lib/game/haptics";
    import OrientationIcon from "$lib/OrientationIcon.svelte";

    type Props = {
        onAnswer: (key: string) => void;
        onSkip: () => void;
        isIOS: boolean;
    };
    let { onAnswer, onSkip, isIOS }: Props = $props();

    const tiles = [
        { key: "horiz", keys: "A/D", labelKey: "orientations.horiz", angle: 0 },
        { key: "diag1", keys: "E", labelKey: "orientations.diag1", angle: 45 },
        { key: "vert", keys: "W/S", labelKey: "orientations.vert", angle: 90 },
        { key: "diag2", keys: "Q", labelKey: "orientations.diag2", angle: 135 },
    ];
</script>

<div class="answer-tiles">
    {#each tiles as tile}
        <button
            class="answer-tile"
            onclick={() => onAnswer(tile.key)}
            {@attach isIOS ? hapticTrigger : undefined}
        >
            <OrientationIcon angle={tile.angle} />
            <span class="tile-label">{$t(tile.labelKey)}</span>
            <span class="tile-keys">{tile.keys}</span>
        </button>
    {/each}
    <button class="answer-tile skip" onclick={onSkip} {@attach isIOS ? hapticTrigger : undefined}>
        {$t("actions.skip")}
    </button>
</div>

<style>
    .answer-tiles {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 12px;
        width: 100%;
        max-width: 400px;
    }
    .answer-tile {
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        color: var(--text-primary);
        padding: 12px 8px;
        cursor: pointer;
        font-family: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        transition: all 0.15s;
        min-height: 80px;
        justify-content: center;
    }
    .answer-tile:active {
        transform: scale(0.95);
        border-color: var(--accent);
        background: rgba(0, 229, 255, 0.1);
    }
    .answer-tile.skip {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: 12px;
        border-style: dashed;
    }
    .tile-label {
        font-size: 12px;
        color: var(--text-primary);
        font-weight: 600;
    }
    .tile-keys {
        font-size: 9px;
        color: var(--text-muted);
        font-family: "SF Mono", "Menlo", monospace;
        background: var(--bg-tertiary);
        padding: 1px 6px;
        border-radius: 3px;
    }
</style>
