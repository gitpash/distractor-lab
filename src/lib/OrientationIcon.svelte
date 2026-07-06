<script lang="ts">
    type Props = {
        angle: number;
        size?: number;
        class?: string;
    };
    let { angle, size = 40, class: className = "" }: Props = $props();

    // Negate angle because SVG y-axis is inverted (y increases downward)
    // but stripe direction is calculated with y increasing upward
    const rad = $derived(-angle * Math.PI / 180);
    const cx = $derived(size / 2);
    const cy = $derived(size / 2);
    const r = $derived(size * 0.4);
    const x1 = $derived(cx + r * Math.cos(rad));
    const y1 = $derived(cy + r * Math.sin(rad));
    const x2 = $derived(cx - r * Math.cos(rad));
    const y2 = $derived(cy - r * Math.sin(rad));
</script>

<svg class="orientation-icon {className}" viewBox="0 0 {size} {size}" width={size} height={size}>
    <line {x1} {y1} {x2} {y2} stroke="currentColor" stroke-width="4" stroke-linecap="round" />
</svg>

<style>
    .orientation-icon {
        display: inline-block;
        color: var(--accent);
    }
</style>
