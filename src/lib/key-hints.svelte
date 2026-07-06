<script lang="ts">
    type Layout = "nav" | "answers";
    let { layout = "nav" }: { layout?: Layout } = $props();

    const answerKeys = [
        { arrow: "&larr;", letters: "A/D", label: "horiz" },
        { arrow: "&uarr;", letters: "E", label: "diag&frasl;" },
        { arrow: "&darr;", letters: "W/S", label: "vert" },
        { arrow: "&rarr;", letters: "Q", label: "diag&frasl;" },
    ];
</script>

<div class="key-bar">
    {#if layout === "nav"}
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
    {:else}
        {#each answerKeys as k, i}
            {#if i > 0}<div class="key-divider"></div>{/if}
            <div class="key-group">
                <span class="key-pair">
                    <kbd>{@html k.arrow}</kbd><kbd class="letter"
                        >{k.letters}</kbd
                    >
                </span>
                <span class="key-label">{@html k.label}</span>
            </div>
        {/each}
    {/if}
</div>

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
        font-size: 10px;
        color: var(--text-muted);
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
    kbd.letter {
        color: var(--text-secondary);
    }
</style>
