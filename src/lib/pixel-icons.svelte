<script lang="ts">
    type IconName = "classic" | "frequency" | "noise" | "fine" | "combo";
    let { name }: { name: IconName } = $props();
</script>

{#if name === "classic"}
    <!-- Gabor patch: concentric rings with center dot -->
    <svg class="pixel-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="icon-rings">
            <!-- outer ring -->
            <rect x="3" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="11" width="1" height="1" fill="currentColor"/>
        </g>
        <g class="icon-inner">
            <!-- inner ring -->
            <rect x="4" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="8" width="1" height="1" fill="currentColor"/>
        </g>
        <g class="icon-dot">
            <!-- center dot -->
            <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
            <rect x="6" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="6" width="1" height="1" fill="currentColor"/>
        </g>
    </svg>

{:else if name === "frequency"}
    <!-- Vertical stripes that can wave -->
    <svg class="pixel-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="icon-stripes">
            <!-- stripe 1 -->
            <rect x="1" y="0" width="1" height="12" fill="currentColor"/>
            <!-- stripe 2 -->
            <rect x="3" y="0" width="1" height="12" fill="currentColor"/>
            <!-- stripe 3 -->
            <rect x="5" y="0" width="1" height="12" fill="currentColor"/>
            <!-- stripe 4 -->
            <rect x="7" y="0" width="1" height="12" fill="currentColor"/>
            <!-- stripe 5 -->
            <rect x="9" y="0" width="1" height="12" fill="currentColor"/>
        </g>
        <!-- wave overlay pixels -->
        <g class="icon-wave">
            <rect x="2" y="2" width="1" height="1" fill="currentColor" opacity="0.4"/>
            <rect x="4" y="4" width="1" height="1" fill="currentColor" opacity="0.4"/>
            <rect x="6" y="6" width="1" height="1" fill="currentColor" opacity="0.4"/>
            <rect x="8" y="8" width="1" height="1" fill="currentColor" opacity="0.4"/>
        </g>
    </svg>

{:else if name === "noise"}
    <!-- Static noise pattern -->
    <svg class="pixel-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="icon-static">
            <rect x="0" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="0" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="7" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="10" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="4" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="11" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="11" width="1" height="1" fill="currentColor"/>
        </g>
        <!-- signal highlight -->
        <g class="icon-signal">
            <rect x="4" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
            <rect x="7" y="7" width="1" height="1" fill="currentColor"/>
        </g>
    </svg>

{:else if name === "fine"}
    <!-- Two targets (2AFC) -->
    <svg class="pixel-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="icon-target-a">
            <!-- left target outer -->
            <rect x="0" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="3" y="8" width="1" height="1" fill="currentColor"/>
            <!-- left target center -->
            <rect x="1" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="5" width="1" height="1" fill="currentColor"/>
        </g>
        <g class="icon-vs">
            <!-- VS divider -->
            <rect x="5" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="6" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="7" width="1" height="1" fill="currentColor"/>
        </g>
        <g class="icon-target-b">
            <!-- right target outer -->
            <rect x="8" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="1" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="8" width="1" height="1" fill="currentColor"/>
            <!-- right target center -->
            <rect x="9" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="9" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="5" width="1" height="1" fill="currentColor"/>
        </g>
    </svg>

{:else if name === "combo"}
    <!-- Circle with cross / starburst -->
    <svg class="pixel-icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="icon-circle">
            <!-- outer circle -->
            <rect x="4" y="0" width="4" height="1" fill="currentColor"/>
            <rect x="2" y="1" width="2" height="1" fill="currentColor"/>
            <rect x="8" y="1" width="2" height="1" fill="currentColor"/>
            <rect x="1" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="2" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="9" width="1" height="1" fill="currentColor"/>
            <rect x="2" y="10" width="2" height="1" fill="currentColor"/>
            <rect x="8" y="10" width="2" height="1" fill="currentColor"/>
            <rect x="4" y="11" width="4" height="1" fill="currentColor"/>
        </g>
        <g class="icon-cross">
            <!-- cross / plus -->
            <rect x="5" y="2" width="2" height="1" fill="currentColor"/>
            <rect x="5" y="3" width="2" height="1" fill="currentColor"/>
            <rect x="5" y="4" width="2" height="1" fill="currentColor"/>
            <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
            <rect x="5" y="7" width="2" height="1" fill="currentColor"/>
            <rect x="5" y="8" width="2" height="1" fill="currentColor"/>
            <rect x="5" y="9" width="2" height="1" fill="currentColor"/>
            <rect x="2" y="5" width="3" height="2" fill="currentColor"/>
            <rect x="7" y="5" width="3" height="2" fill="currentColor"/>
        </g>
    </svg>
{/if}

<style>
    .pixel-icon {
        display: block;
        width: 48px;
        height: 48px;
        margin: 0 auto 10px;
        color: var(--accent);
        image-rendering: pixelated;
    }
</style>
