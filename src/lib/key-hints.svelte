<script lang="ts">
    import { t } from "svelte-i18n";
    import DirIcon from "$lib/DirIcon.svelte";

    type Layout = "nav" | "answers";
    type Props = {
        layout?: Layout;
        onKey?: (key: string) => void;
        activeKey?: string;
    };
    let { layout = "nav", onKey, activeKey = "" }: Props = $props();

    const answerKeys = [
        { key: "horiz", dir: "horiz" as const, letters: "A/D", labelKey: "orientations.horiz" },
        { key: "diag1", dir: "diag1" as const, letters: "E", labelKey: "orientations.diag1" },
        { key: "vert", dir: "vert" as const, letters: "W/S", labelKey: "orientations.vert" },
        { key: "diag2", dir: "diag2" as const, letters: "Q", labelKey: "orientations.diag2" },
    ];
</script>

{#if layout === "nav"}
    <div class="key-bar nav">
        <div class="key-group">
            <span class="key-pair">
                <kbd>&larr;</kbd><kbd>&rarr;</kbd>
            </span>
            <span class="key-label">select</span>
        </div>
        <div class="key-divider"></div>
        <div class="key-group">
            <span class="key-pair">
                <kbd>Enter</kbd>
            </span>
            <span class="key-label">start</span>
        </div>
    </div>
{:else}
    <div class="key-grid">
        {#each answerKeys as k}
            <button
                class="key-card"
                class:active={activeKey === k.key}
                onclick={() => onKey?.(k.key)}
            >
                <DirIcon direction={k.dir} size={28} />
                <div class="key-card-label">{$t(k.labelKey)}</div>
                <div class="key-card-keys">
                    <kbd>{k.letters}</kbd>
                </div>
            </button>
        {/each}
    </div>
{/if}

<style>
    .key-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 8px 16px;
        margin-top: 12px;
        border: 1px solid var(--border);
        background: var(--bg-secondary);
        flex-wrap: wrap;
    }
    .key-group {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .key-pair {
        display: flex;
        gap: 2px;
    }
    .key-label {
        font-size: 11px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .key-divider {
        width: 1px;
        height: 16px;
        background: var(--border);
        flex-shrink: 0;
    }
    kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        font-family: inherit;
        font-size: 10px;
        color: var(--accent);
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-bottom: 2px solid var(--border);
        line-height: 1;
    }

    /* Answer grid */
    .key-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        width: 100%;
        max-width: 480px;
        margin-top: 12px;
    }
    .key-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 14px 8px;
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
    }
    .key-card:hover {
        border-color: var(--accent);
        background: rgba(0, 229, 255, 0.05);
    }
    .key-card.active {
        border-color: var(--accent);
        background: rgba(0, 229, 255, 0.15);
        box-shadow: 0 0 12px var(--accent-glow);
    }
    .key-card-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-primary);
    }
    .key-card-keys kbd {
        min-width: 28px;
        height: 20px;
        font-size: 10px;
    }
</style>
