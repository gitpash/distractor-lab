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
    <!-- Pixel horizontal line: — -->
    <svg class="dir-icon {className}" viewBox="0 0 12 4" width={size} height={size * 4 / 12}>
        <rect x="0" y="1" width="12" height="2" fill="currentColor"/>
        <rect x="1" y="0" width="10" height="1" fill="currentColor" opacity="0.5"/>
        <rect x="1" y="3" width="10" height="1" fill="currentColor" opacity="0.5"/>
    </svg>
{:else if direction === "vert"}
    <!-- Pixel vertical line: | -->
    <svg class="dir-icon {className}" viewBox="0 0 4 12" width={size * 4 / 12} height={size}>
        <rect x="1" y="0" width="2" height="12" fill="currentColor"/>
        <rect x="0" y="1" width="1" height="10" fill="currentColor" opacity="0.5"/>
        <rect x="3" y="1" width="1" height="10" fill="currentColor" opacity="0.5"/>
    </svg>
{:else if direction === "diag1"}
    <!-- Pixel diagonal ╱ (bottom-left to top-right) -->
    <svg class="dir-icon {className}" viewBox="0 0 12 12" width={size} height={size}>
        <rect x="0" y="10" width="2" height="2" fill="currentColor"/>
        <rect x="1" y="8" width="2" height="2" fill="currentColor"/>
        <rect x="2" y="7" width="2" height="1" fill="currentColor"/>
        <rect x="3" y="5" width="2" height="2" fill="currentColor"/>
        <rect x="4" y="4" width="2" height="1" fill="currentColor"/>
        <rect x="5" y="3" width="2" height="1" fill="currentColor"/>
        <rect x="6" y="2" width="2" height="1" fill="currentColor"/>
        <rect x="7" y="1" width="2" height="1" fill="currentColor"/>
        <rect x="8" y="0" width="2" height="1" fill="currentColor"/>
        <rect x="9" y="0" width="2" height="1" fill="currentColor" opacity="0.5"/>
        <rect x="0" y="11" width="1" height="1" fill="currentColor" opacity="0.5"/>
        <rect x="9" y="1" width="1" height="1" fill="currentColor" opacity="0.3"/>
    </svg>
{:else if direction === "diag2"}
    <!-- Pixel diagonal ╲ (top-left to bottom-right) -->
    <svg class="dir-icon {className}" viewBox="0 0 12 12" width={size} height={size}>
        <rect x="0" y="0" width="2" height="1" fill="currentColor"/>
        <rect x="0" y="1" width="1" height="1" fill="currentColor" opacity="0.3"/>
        <rect x="2" y="1" width="2" height="1" fill="currentColor"/>
        <rect x="3" y="2" width="2" height="1" fill="currentColor"/>
        <rect x="4" y="3" width="2" height="1" fill="currentColor"/>
        <rect x="5" y="4" width="2" height="2" fill="currentColor"/>
        <rect x="6" y="5" width="2" height="1" fill="currentColor"/>
        <rect x="7" y="7" width="2" height="1" fill="currentColor"/>
        <rect x="8" y="8" width="2" height="2" fill="currentColor"/>
        <rect x="9" y="10" width="2" height="1" fill="currentColor"/>
        <rect x="0" y="0" width="1" height="1" fill="currentColor" opacity="0.5"/>
        <rect x="10" y="11" width="1" height="1" fill="currentColor" opacity="0.5"/>
    </svg>
{/if}

<style>
    .dir-icon {
        display: inline-block;
        color: var(--accent);
        image-rendering: pixelated;
    }
</style>
