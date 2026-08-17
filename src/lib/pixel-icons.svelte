<script lang="ts">
    import { transition, getAnimClass, type AnimState } from "$lib/game/icon-animation";

    type IconName = "classic" | "frequency" | "noise" | "fine" | "combo" | "lateral";
    let { name, active = false }: { name: IconName; active?: boolean } = $props();

    let animState: AnimState = $state('idle');
    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

    // Sync with external active prop
    $effect(() => {
        if (active && animState !== 'active') {
            animState = transition(animState, { type: 'SELECT' });
        } else if (!active && animState === 'active') {
            animState = transition(animState, { type: 'DESELECT' });
        }
    });

    function handlePointerEnter() {
        animState = transition(animState, { type: 'HOVER_START' });
        hoverTimeout = setTimeout(() => {
            animState = transition(animState, { type: 'HOVER_END', selected: active });
        }, 500);
    }

    function handlePointerLeave() {
        if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
        animState = transition(animState, { type: 'HOVER_END', selected: active });
    }

    function handleAnimationEnd() {
        animState = transition(animState, { type: 'ANIMATION_END', selected: active });
    }

    const animClass = $derived(getAnimClass(animState, name));
</script>

{#if name === "classic"}
    <!-- Gabor patch: concentric rings with center dot -->
    <svg
        class="pixel-icon icon-classic {animClass}"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onanimationend={handleAnimationEnd}
    >
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
    <svg
        class="pixel-icon icon-frequency {animClass}"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onanimationend={handleAnimationEnd}
    >
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
    <svg
        class="pixel-icon icon-noise {animClass}"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onanimationend={handleAnimationEnd}
    >
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
    <svg
        class="pixel-icon icon-fine {animClass}"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onanimationend={handleAnimationEnd}
    >
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
    <!-- Dice — classic random symbol -->
    <svg
        class="pixel-icon icon-combo {animClass}"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onanimationend={handleAnimationEnd}
    >
        <g class="icon-dice">
            <!-- outer border -->
            <rect x="1" y="0" width="10" height="1" fill="currentColor"/>
            <rect x="0" y="1" width="1" height="10" fill="currentColor"/>
            <rect x="11" y="1" width="1" height="10" fill="currentColor"/>
            <rect x="1" y="11" width="10" height="1" fill="currentColor"/>
            <!-- face: 5 dots (quincunx) -->
            <rect x="3" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
            <rect x="3" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="8" y="8" width="1" height="1" fill="currentColor"/>
        </g>
    </svg>

{:else if name === "lateral"}
    <!-- Lateral masking: 3 collinear patches (flankers + target) -->
    <svg
        class="pixel-icon icon-lateral {animClass}"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        onpointerenter={handlePointerEnter}
        onpointerleave={handlePointerLeave}
        onanimationend={handleAnimationEnd}
    >
        <g class="icon-flankers">
            <!-- left flanker -->
            <rect x="0" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="1" y="8" width="1" height="1" fill="currentColor"/>
            <!-- right flanker -->
            <rect x="11" y="4" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="5" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="6" width="1" height="1" fill="currentColor"/>
            <rect x="11" y="7" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="3" width="1" height="1" fill="currentColor"/>
            <rect x="10" y="8" width="1" height="1" fill="currentColor"/>
        </g>
        <g class="icon-target">
            <!-- center target (brighter) -->
            <rect x="5" y="3" width="2" height="1" fill="currentColor"/>
            <rect x="4" y="4" width="4" height="1" fill="currentColor"/>
            <rect x="4" y="5" width="4" height="2" fill="currentColor"/>
            <rect x="4" y="7" width="4" height="1" fill="currentColor"/>
            <rect x="5" y="8" width="2" height="1" fill="currentColor"/>
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
        transition: transform 0.2s;
    }

    /* ===== HOVER: quick animation per mode ===== */
    .icon-classic.hover { animation: hCoinFlip 0.5s ease-in-out; }
    .icon-frequency.hover { animation: hBreath 0.4s ease-in-out; }
    .icon-noise.hover { animation: hStatic 0.3s steps(3); }
    .icon-fine.hover { animation: hBlink 0.4s ease-in-out; }
    .icon-combo.hover { animation: hShake 0.4s ease-in-out; }
    .icon-lateral.hover { animation: hPulse 0.4s ease-in-out; }

    @keyframes hCoinFlip {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(180deg) scale(0.85); }
        100% { transform: rotateY(360deg); }
    }
    @keyframes hBreath {
        0%, 100% { transform: scaleX(1); }
        50% { transform: scaleX(1.15); }
    }
    @keyframes hStatic {
        0% { transform: translate(1px, -1px); }
        33% { transform: translate(-1px, 1px); }
        66% { transform: translate(1px, 0px); }
        100% { transform: translate(0px, 0px); }
    }
    @keyframes hBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    @keyframes hShake {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(-15deg); }
        40% { transform: rotate(12deg); }
        60% { transform: rotate(-8deg); }
        80% { transform: rotate(4deg); }
    }
    @keyframes hPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    /* ===== ACTIVE: slow continuous loop per mode ===== */
    .icon-classic.active {
        animation: activeCoinSpin 4s linear infinite;
        transform-style: preserve-3d;
    }
    .icon-frequency.active {
        animation: activeStripeBreath 2.5s ease-in-out infinite;
    }
    .icon-noise.active {
        animation: activeNoiseShimmer 2s steps(4) infinite;
    }
    .icon-fine.active {
        animation: activeTargetBlink 2.5s ease-in-out infinite;
    }
    .icon-combo.active {
        animation: activeDiceRoll 1.5s ease-in-out infinite;
    }
    .icon-lateral.active {
        animation: activeLateralPulse 2s ease-in-out infinite;
    }

    @keyframes activeCoinSpin {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
    }
    @keyframes activeStripeBreath {
        0%, 100% { transform: scaleX(1); }
        50% { transform: scaleX(1.25); }
    }
    @keyframes activeNoiseShimmer {
        0% { transform: translate(0, 0); filter: brightness(1); }
        25% { transform: translate(0.5px, -0.5px); filter: brightness(1.2); }
        50% { transform: translate(-0.5px, 0.5px); filter: brightness(0.9); }
        75% { transform: translate(0.5px, 0.5px); filter: brightness(1.1); }
        100% { transform: translate(0, 0); filter: brightness(1); }
    }
    @keyframes activeTargetBlink {
        0%, 45%, 55%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    @keyframes activeDiceRoll {
        0%, 100% { transform: rotate(0deg) translateY(0); }
        20% { transform: rotate(-8deg) translateY(-2px); }
        40% { transform: rotate(6deg) translateY(0); }
        60% { transform: rotate(-4deg) translateY(-1px); }
        80% { transform: rotate(2deg) translateY(0); }
    }
    @keyframes activeLateralPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.08); opacity: 0.8; }
    }
</style>
