<script lang="ts">
    type Direction = "horiz" | "vert" | "diag1" | "diag2";
    type Props = {
        direction: Direction;
        size?: number;
        class?: string;
    };
    let { direction, size = 24, class: className = "" }: Props = $props();
</script>

{#if direction === "horiz"}
    <div class="size-6 bg-white p-0! m-0!">
        <div class="horizontal"></div>
    </div>
{:else if direction === "vert"}
    <!-- Clean pixel vertical: | -->
    <svg
        class="dir-icon {className}"
        viewBox="0 0 4 16"
        width={(size * 4) / 16}
        height={size}
    >
        <rect x="1" y="0" width="2" height="16" fill="currentColor" rx="1" />
    </svg>
{:else if direction === "diag1"}
    <!-- Clean pixel diagonal ╱ -->
    <svg
        class="dir-icon {className}"
        viewBox="0 0 16 16"
        width={size}
        height={size}
    >
        <rect x="1" y="14" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="3" y="11" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="5" y="8" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="7" y="5" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="9" y="2" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="11" y="0" width="3" height="2" fill="currentColor" rx="1" />
    </svg>
{:else if direction === "diag2"}
    <!-- Clean pixel diagonal ╲ -->
    <svg
        class="dir-icon {className}"
        viewBox="0 0 16 16"
        width={size}
        height={size}
    >
        <rect x="1" y="0" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="3" y="3" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="5" y="6" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="7" y="9" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="9" y="12" width="3" height="2" fill="currentColor" rx="1" />
        <rect x="11" y="14" width="3" height="2" fill="currentColor" rx="1" />
    </svg>
{/if}

<style>
    /*.dir-icon {
        display: inline-block;
        color: var(--accent);
    }*/
    .horizontal {
        width: 4px;
        height: 4px;
        margin-top: 10px;
        margin-left: 4px;
        box-shadow:
            /*-12px 0 var(--accent),*/
            /*-8px 0 var(--accent),*/
            -4px 0px var(--accent),
            0px 0px var(--accent),
            4px 0px var(--accent),
            8px 0px var(--accent),
            12px 0px var(--accent);
    }
</style>
