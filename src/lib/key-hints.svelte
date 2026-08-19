<script lang="ts">
    import { t } from "svelte-i18n";
    import DirIcon from "$lib/DirIcon.svelte";

    type Layout = "nav" | "answers";
    type Props = {
        layout?: Layout;
        onKey?: (key: string) => void;
        activeKey?: string;
        modeType?: "4afc" | "2afc";
    };
    let { layout = "nav", onKey, activeKey = "", modeType = "4afc" }: Props = $props();

    const answerKeys = [
        { key: "horiz", dir: "horiz" as const, letters: "A/D", labelKey: "orientations.horiz" },
        { key: "diag1", dir: "diag1" as const, letters: "E", labelKey: "orientations.diag1" },
        { key: "vert", dir: "vert" as const, letters: "W/S", labelKey: "orientations.vert" },
        { key: "diag2", dir: "diag2" as const, letters: "Q", labelKey: "orientations.diag2" },
    ];

    const twoAfcKeys = [
        { key: "left", label: "orientations.left", letters: "←/A", symbol: "◀" },
        { key: "right", label: "orientations.right", letters: "→/D", symbol: "▶" },
    ];
</script>

{#if layout === "nav"}
    <div class="key-bar">
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
    {#if modeType === "2afc"}
        <div class="key-grid-2afc">
            {#each twoAfcKeys as k}
                <button
                    class="key-card"
                    class:active={activeKey === k.key}
                    onclick={() => onKey?.(k.key)}
                >
                    <span class="key-card-symbol">{k.symbol}</span>
                    <span class="key-card-label">{$t(k.label)}</span>
                    <kbd>{k.letters}</kbd>
                </button>
            {/each}
        </div>
    {:else}
        <div class="key-grid">
            {#each answerKeys as k}
                <button
                    class="key-card"
                    class:active={activeKey === k.key}
                    onclick={() => onKey?.(k.key)}
                >
                    <DirIcon direction={k.dir} size={24} />
                    <span class="key-card-label">{$t(k.labelKey)}</span>
                    <kbd>{k.letters}</kbd>
                </button>
            {/each}
        </div>
    {/if}
{/if}

<style>
    /* ── Nav bar — translucent material ── */
    .key-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 6px 14px;
        margin-top: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(19, 24, 32, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
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
        font-size: var(--text-xs);
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

    /* ── Answer grid ── */
    .key-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        width: 100%;
        max-width: 400px;
        margin-top: 12px;
    }
    .key-grid-2afc {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        width: 100%;
        max-width: 400px;
        margin-top: 12px;
    }
    .key-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px 8px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        cursor: pointer;
        font-family: inherit;
        color: var(--text-primary);
        transition:
            transform var(--duration-fast) ease-out,
            border-color var(--duration-normal) ease,
            box-shadow var(--duration-normal) ease;
    }
    @media (hover: hover) and (pointer: fine) {
        .key-card:hover {
            border-color: var(--accent-dim);
        }
    }
    .key-card:active {
        transform: scale(0.97);
    }
    .key-card.active {
        border-color: var(--accent);
        box-shadow: 0 0 12px var(--accent-glow);
    }
    .key-card :global(.dir-icon) {
        color: var(--text-secondary);
        transition: color var(--duration-normal) ease;
    }
    .key-card.active :global(.dir-icon) {
        color: var(--accent);
    }
    .key-card-label {
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--text-secondary);
        letter-spacing: 0.3px;
    }
    .key-card.active .key-card-label {
        color: var(--accent);
    }
    .key-card kbd {
        min-width: 32px;
        height: 20px;
        font-size: var(--text-xs);
    }
    .key-card-symbol {
        font-size: 24px;
        color: var(--text-secondary);
        transition: color var(--duration-normal) ease;
    }
    .key-card.active .key-card-symbol {
        color: var(--accent);
    }
</style>
