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
    <svg
        class="dir-icon {className}"
        viewBox="0 0 16 16"
        width={size}
        height={size}
    >
        <rect x="1" y="7" width="14" height="2" fill="currentColor" rx="1" />
    </svg>
{:else if direction === "vert"}
    <svg
        class="dir-icon {className}"
        viewBox="0 0 16 16"
        width={size}
        height={size}
    >
        <rect x="7" y="1" width="2" height="14" fill="currentColor" rx="1" />
    </svg>
{:else if direction === "diag1"}
    <!-- ╱ -->
    <svg
        class="dir-icon {className}"
        viewBox="0 0 16 16"
        width={size}
        height={size}
    >
        <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
{:else if direction === "diag2"}
    <!-- ╲ -->
    <svg
        class="dir-icon {className}"
        viewBox="0 0 16 16"
        width={size}
        height={size}
    >
        <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
{/if}
