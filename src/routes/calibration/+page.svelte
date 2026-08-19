<script lang="ts">
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { CANVAS_SIZE, showBlank } from "$lib/game/renderer";
    import {
        createCalibrationState,
        renderGammaCheck,
        renderFloorPatch,
        renderCheckPatch,
        estimateGamma,
        buildProfile,
    } from "$lib/game/calibration";
    import { triggerHaptic } from "$lib/game/haptics";
    import { useHaptics, useGameTimers } from "$lib/game/hooks";

    useHaptics();
    const timers = useGameTimers();

    let canvasEl: HTMLCanvasElement | null = $state(null);
    let ctx: CanvasRenderingContext2D | null = null;
    let cs = $state(createCalibrationState());

    const estimatedGamma = $derived(estimateGamma(cs.gammaBrightness));

    const phaseStep = $derived.by(() => {
        switch (cs.phase) {
            case "setup": return "1 / 3";
            case "gamma": return "2 / 3";
            case "floor": return "3 / 3";
            default: return "";
        }
    });

    function ensureCtx(): CanvasRenderingContext2D | null {
        if (!canvasEl) return null;
        if (!ctx || ctx.canvas !== canvasEl) {
            ctx = canvasEl.getContext("2d");
        }
        return ctx;
    }

    function drawBlank() {
        const c = ensureCtx();
        if (c) showBlank(c);
    }

    // ── Phase 1: Setup ────────────────────────────────────────────
    function proceedFromSetup() {
        cs.phase = "gamma";
        triggerHaptic("nudge");
    }

    // ── Phase 2: Gamma check ──────────────────────────────────────
    function drawGamma() {
        const c = ensureCtx();
        if (!c) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = c.createImageData(w, h);
        renderGammaCheck(imageData.data, w, h, cs.gammaBrightness);
        c.putImageData(imageData, 0, 0);
    }

    function adjustGamma(delta: number) {
        cs.gammaBrightness = Math.max(0, Math.min(255, cs.gammaBrightness + delta));
        drawGamma();
        triggerHaptic("nudge");
    }

    function confirmGamma() {
        cs.gammaComplete = true;
        cs.phase = "floor";
        triggerHaptic("success");
    }

    // ── Phase 3: Contrast floor ───────────────────────────────────
    function drawFloor() {
        const c = ensureCtx();
        if (!c) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = c.createImageData(w, h);
        renderFloorPatch(imageData.data, w, h, cs.floorContrast);
        c.putImageData(imageData, 0, 0);
    }

    function adjustFloorContrast(delta: number) {
        cs.floorContrast = Math.max(0, Math.min(1.0, cs.floorContrast + delta));
        drawFloor();
        triggerHaptic("nudge");
    }

    function confirmFloor() {
        cs.floorFound = true;
        cs.floorComplete = true;
        cs.phase = "check";
        triggerHaptic("success");
    }

    // ── Quality check → save & go to results ──────────────────────
    function toggleCheckVisible() {
        cs.checkVisible = !cs.checkVisible;
        drawCheck();
        triggerHaptic("nudge");
    }

    function drawCheck() {
        const c = ensureCtx();
        if (!c) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = c.createImageData(w, h);
        renderCheckPatch(imageData.data, w, h, cs.checkVisible);
        c.putImageData(imageData, 0, 0);
    }

    function confirmCheck() {
        cs.checkComplete = true;
        cs.profile = buildProfile(cs);
        sessionStorage.setItem("calibrationProfile", JSON.stringify(cs.profile));
        triggerHaptic("success");
        goto("/results?mode=calibration");
    }

    // ── Keyboard ──────────────────────────────────────────────────
    function onKeydown(e: KeyboardEvent) {
        const code = e.code;
        if (cs.phase === "gamma") {
            if (code === "ArrowLeft" || code === "KeyA") { e.preventDefault(); adjustGamma(-5); }
            else if (code === "ArrowRight" || code === "KeyD") { e.preventDefault(); adjustGamma(5); }
            else if (code === "Enter" || code === "Space") { e.preventDefault(); confirmGamma(); }
            return;
        }
        if (cs.phase === "floor") {
            if (code === "ArrowLeft" || code === "KeyA") { e.preventDefault(); adjustFloorContrast(-0.02); }
            else if (code === "ArrowRight" || code === "KeyD") { e.preventDefault(); adjustFloorContrast(0.02); }
            else if (code === "Enter" || code === "Space") { e.preventDefault(); confirmFloor(); }
            return;
        }
        if (cs.phase === "check") {
            if (code === "Space" || code === "ArrowRight" || code === "KeyD") { e.preventDefault(); toggleCheckVisible(); }
            else if (code === "Enter") { e.preventDefault(); confirmCheck(); }
            return;
        }
    }

    // ── Phase drawing ─────────────────────────────────────────────
    let lastDrawnPhase = "";
    $effect(() => {
        const phase = cs.phase;
        if (phase === lastDrawnPhase) return;
        lastDrawnPhase = phase;

        const timer = setTimeout(() => {
            if (phase === "gamma") {
                drawGamma();
            } else if (phase === "floor") {
                drawFloor();
            } else if (phase === "check") {
                drawCheck();
            } else {
                drawBlank();
            }
        }, 50);

        return () => clearTimeout(timer);
    });

    $effect(() => () => timers.clearTimers());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="calibration-screen">
    {#if cs.phase === "setup"}
        <div class="phase-content">
            <div class="phase-step">{$t("calibration.step")} {phaseStep}</div>
            <h2>{$t("calibration.title")}</h2>
            <p class="phase-desc">{$t("calibration.setupDesc")}</p>

            <div class="setup-steps">
                <div class="setup-step">
                    <span class="step-num">1</span>
                    <div>
                        <strong>{$t("calibration.step1Title")}</strong>
                        <p>{$t("calibration.step1Desc")}</p>
                    </div>
                </div>
                <div class="setup-step">
                    <span class="step-num">2</span>
                    <div>
                        <strong>{$t("calibration.step2Title")}</strong>
                        <p>{$t("calibration.step2Desc")}</p>
                    </div>
                </div>
                <div class="setup-step">
                    <span class="step-num">3</span>
                    <div>
                        <strong>{$t("calibration.step3Title")}</strong>
                        <p>{$t("calibration.step3Desc")}</p>
                    </div>
                </div>
            </div>

            <button class="btn btn-primary" onclick={proceedFromSetup}>
                {$t("calibration.next")}
            </button>
        </div>

    {:else if cs.phase === "gamma"}
        <div class="phase-content">
            <div class="phase-step">{$t("calibration.step")} {phaseStep}</div>
            <h2>{$t("calibration.gammaTitle")}</h2>
            <p class="phase-desc">{$t("calibration.gammaDesc")}</p>

            <div class="canvas-wrap">
                <canvas
                    bind:this={canvasEl}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    id="calCanvas"
                ></canvas>
            </div>

            <div class="gamma-controls">
                <span class="gamma-label">{$t("calibration.brightness")}: {cs.gammaBrightness}</span>
                {#if estimatedGamma !== null}
                    <span class="gamma-est">≈ γ {estimatedGamma.toFixed(2)}</span>
                {/if}
                <div class="gamma-buttons">
                    <button class="btn btn-ghost" onclick={() => adjustGamma(-10)}>−10</button>
                    <button class="btn btn-ghost" onclick={() => adjustGamma(-5)}>−5</button>
                    <button class="btn btn-ghost" onclick={() => adjustGamma(5)}>+5</button>
                    <button class="btn btn-ghost" onclick={() => adjustGamma(10)}>+10</button>
                </div>
                <button class="btn btn-ghost btn-sm" onclick={() => { cs.gammaBrightness = 186; drawGamma(); triggerHaptic("nudge"); }}>
                    {$t("calibration.resetTypical")}
                </button>
            </div>

            <p class="gamma-hint">{$t("calibration.gammaHint")}</p>

            <button class="btn btn-primary" onclick={confirmGamma}>
                {$t("calibration.gammaConfirm")}
            </button>
        </div>

    {:else if cs.phase === "floor"}
        <div class="phase-content">
            <div class="phase-step">{$t("calibration.step")} {phaseStep}</div>
            <h2>{$t("calibration.floorTitle")}</h2>
            <p class="phase-desc">{$t("calibration.floorDesc")}</p>

            <div class="canvas-wrap">
                <canvas
                    bind:this={canvasEl}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    id="calCanvas"
                ></canvas>
            </div>

            <div class="floor-controls">
                <span class="floor-contrast">{$t("calibration.contrast")}: {(cs.floorContrast * 100).toFixed(0)}%</span>
                <div class="floor-buttons">
                    <button class="btn btn-ghost" onclick={() => adjustFloorContrast(-0.02)}>−</button>
                    <button class="btn btn-ghost" onclick={() => adjustFloorContrast(0.02)}>+</button>
                </div>
            </div>

            <p class="floor-hint">{$t("calibration.floorHint")}</p>

            <button class="btn btn-primary" onclick={confirmFloor}>
                {$t("calibration.floorConfirm")}
            </button>
        </div>

    {:else if cs.phase === "check"}
        <div class="phase-content">
            <div class="phase-step">{$t("calibration.step")} {phaseStep}</div>
            <h2>{$t("calibration.checkTitle")}</h2>
            <p class="phase-desc">{$t("calibration.checkDesc")}</p>

            <div class="canvas-wrap">
                <canvas
                    bind:this={canvasEl}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    id="calCanvas"
                ></canvas>
            </div>

            <div class="check-controls">
                <button class="btn btn-ghost" onclick={toggleCheckVisible}>
                    {cs.checkVisible ? $t("calibration.hidePatch") : $t("calibration.showPatch")}
                </button>
            </div>

            <p class="check-hint">{$t("calibration.checkHint")}</p>

            <button class="btn btn-primary" onclick={confirmCheck}>
                {$t("calibration.next")}
            </button>
        </div>
    {/if}
</div>

<style>
    .calibration-screen {
        width: 100%;
        max-width: 600px;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }
    .phase-content {
        text-align: center;
        max-width: 440px;
        width: 100%;
    }
    .phase-content h2 {
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--accent);
        margin-bottom: 8px;
    }
    .phase-step {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 4px;
    }
    .phase-desc {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 16px;
    }
    .setup-steps {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
        text-align: left;
    }
    .setup-step {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 12px;
        background: var(--bg-secondary);
        border-radius: var(--radius);
        border: 1px solid var(--border);
    }
    .step-num {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        min-width: 24px;
        border-radius: 50%;
        background: var(--accent);
        color: var(--text-on-accent);
        font-size: var(--text-xs);
        font-weight: 700;
    }
    .setup-step strong {
        display: block;
        font-size: var(--text-sm);
        color: var(--text-primary);
        margin-bottom: 2px;
    }
    .setup-step p {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin: 0;
        line-height: 1.4;
    }
    .canvas-wrap {
        position: relative;
        width: min(80vw, 80vh, 360px);
        height: min(80vw, 80vh, 360px);
        background: var(--bg-tertiary);
        border-radius: var(--radius);
        overflow: hidden;
        margin: 0 auto 12px;
    }
    #calCanvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
    }
    .gamma-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    .gamma-label {
        font-size: var(--text-sm);
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
    }
    .gamma-est {
        font-size: var(--text-xs);
        color: var(--accent);
        font-variant-numeric: tabular-nums;
    }
    .gamma-buttons {
        display: flex;
        gap: 4px;
    }
    .gamma-buttons .btn {
        min-width: 48px;
        font-size: var(--text-sm);
    }
    .btn-sm {
        font-size: var(--text-xs);
        padding: 4px 10px;
        opacity: 0.7;
    }
    .gamma-hint {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin: 12px 0 16px;
        line-height: 1.4;
    }
    .floor-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .floor-contrast {
        font-size: var(--text-sm);
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
    }
    .floor-buttons {
        display: flex;
        gap: 4px;
    }
    .floor-buttons .btn {
        min-width: 40px;
    }
    .floor-hint {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin: 12px 0 16px;
        line-height: 1.4;
    }
    .check-controls {
        display: flex;
        justify-content: center;
        margin-bottom: 8px;
    }
    .check-hint {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin: 12px 0 16px;
        line-height: 1.4;
    }
</style>
