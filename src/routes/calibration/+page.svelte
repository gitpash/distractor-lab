<script lang="ts">
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { ORIENTATIONS } from "$lib";
    import { CANVAS_SIZE, renderPatch, showBlank } from "$lib/game/renderer";
    import {
        createCalibrationState,
        getCurrentCalibrationFreq,
        getCurrentCalibrationOrient,
        processCalibrationAnswer,
        getCalibrationProfile,
        renderGammaCheck,
        renderFloorCheck,
        estimateGamma,
        CALIBRATION_FREQUENCIES,
        CALIBRATION_ORIENTATIONS,
    } from "$lib/game/calibration";
    import { getKeyBinding } from "$lib/game/keyboard";
    import KeyHints from "$lib/key-hints.svelte";
    import {
        initHaptics,
        triggerHaptic,
        destroyHaptics,
    } from "$lib/game/haptics";
    import { onMount } from "svelte";

    onMount(() => {
        initHaptics();
        return () => destroyHaptics();
    });

    let canvasEl: HTMLCanvasElement | null = $state(null);
    let ctx: CanvasRenderingContext2D | null = null;
    let cs = $state(createCalibrationState());
    let fixationOpacity = $state(0);
    let showFeedback = $state(false);
    let feedbackText = $state("");
    let feedbackType = $state("correct" as "correct" | "wrong");
    let activeKey = $state("");
    let animFrameId = 0;

    let loopTimeout: ReturnType<typeof setTimeout> | null = null;

    const estimatedGamma = $derived(estimateGamma(cs.gammaBrightness));

    const phaseStep = $derived(() => {
        switch (cs.phase) {
            case "setup": return "1 / 4";
            case "gamma": return "2 / 4";
            case "floor": return "3 / 4";
            case "thresholds": return "4 / 4";
            default: return "";
        }
    });

    function clearTimers() {
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = 0;
        }
    }

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

    // ── Phase 3: Floor check ──────────────────────────────────────
    function drawFloor() {
        const c = ensureCtx();
        if (!c) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = c.createImageData(w, h);
        const contrast = cs.floorContrast * cs.floorGain;
        renderFloorCheck(imageData.data, w, h, contrast, cs.floorVisible);
        c.putImageData(imageData, 0, 0);
    }

    function toggleFloorVisible() {
        cs.floorVisible = !cs.floorVisible;
        drawFloor();
        triggerHaptic("nudge");
    }

    function adjustFloorGain(delta: number) {
        cs.floorGain = Math.max(0.1, Math.min(3.0, cs.floorGain + delta));
        drawFloor();
        triggerHaptic("nudge");
    }

    function confirmFloor() {
        cs.floorComplete = true;
        cs.phase = "thresholds";
        triggerHaptic("success");
    }

    // ── Phase 4: Threshold measurement ────────────────────────────
    function renderCurrentTrial() {
        const c = ensureCtx();
        if (!c || !cs.running) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = c.createImageData(w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = 128;
            data[i + 3] = 255;
        }

        const freq = getCurrentCalibrationFreq(cs);
        const orient = getCurrentCalibrationOrient(cs);
        const phase = Math.random() * Math.PI * 2;

        renderPatch(data, w, h, {
            orientation: ORIENTATIONS[orient].angle,
            contrast: cs.currentThreshold,
            spatialFreq: freq,
            sigma: 1.0 / freq,
            noise: 0,
            phase,
            cx: 150,
            cy: 150,
            radius: 80,
        });

        c.putImageData(imageData, 0, 0);
    }

    function calibrationLoop() {
        if (!cs.running || cs.phase !== "thresholds") return;

        // Step 1: Fixation cross
        fixationOpacity = 1;
        drawBlank();

        loopTimeout = setTimeout(() => {
            if (!cs.running || cs.phase !== "thresholds") return;

            // Step 2: Show stimulus
            fixationOpacity = 0;
            renderCurrentTrial();

            loopTimeout = setTimeout(() => {
                if (!cs.running || cs.phase !== "thresholds") return;

                // Step 3: Blank (ISI)
                drawBlank();

                loopTimeout = setTimeout(() => {
                    if (!cs.running || cs.phase !== "thresholds") return;

                    // Step 4: Waiting for response
                    cs.waitingForResponse = true;
                }, cs.isi);
            }, cs.stimulusDuration);
        }, 300);
    }

    function handleAnswer(key: string) {
        if (!cs.waitingForResponse || !cs.running) return;
        cs.waitingForResponse = false;

        const orient = getCurrentCalibrationOrient(cs);
        const isCorrect = key === orient;

        if (isCorrect) {
            feedbackText = "✓";
            feedbackType = "correct";
            triggerHaptic("success");
        } else {
            feedbackText = "✗";
            feedbackType = "wrong";
            triggerHaptic("error");
        }
        showFeedback = true;

        const { allComplete } = processCalibrationAnswer(cs, isCorrect);

        loopTimeout = setTimeout(() => {
            showFeedback = false;
            if (allComplete) {
                endCalibration();
            } else {
                calibrationLoop();
            }
        }, 500);
    }

    function onKeydown(e: KeyboardEvent) {
        if (cs.phase === "gamma") {
            if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); adjustGamma(-5); }
            else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); adjustGamma(5); }
            else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); confirmGamma(); }
            return;
        }
        if (cs.phase === "floor") {
            if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); adjustFloorGain(-0.1); }
            else if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); adjustFloorGain(0.1); }
            else if (e.key === " ") { e.preventDefault(); toggleFloorVisible(); }
            else if (e.key === "Enter") { e.preventDefault(); confirmFloor(); }
            return;
        }
        if (cs.phase === "thresholds") {
            if (!cs.waitingForResponse) return;
            const key = getKeyBinding(e, "4afc");
            if (!key) return;
            e.preventDefault();
            activeKey = key;
            setTimeout(() => { activeKey = ""; }, 300);
            handleAnswer(key);
        }
    }

    function endCalibration() {
        cs.running = false;
        drawBlank();
        const profile = getCalibrationProfile(cs);
        sessionStorage.setItem('calibrationProfile', JSON.stringify(profile));
        goto("/results?mode=calibration");
    }

    // Draw when canvas appears or phase changes
    // Only depends on phase — calibrationLoop manages its own async rendering
    let lastDrawnPhase = "";
    $effect(() => {
        const phase = cs.phase;
        if (phase === lastDrawnPhase) return;
        lastDrawnPhase = phase;

        // Small delay to let canvas mount
        const timer = setTimeout(() => {
            if (phase === "gamma") {
                drawGamma();
            } else if (phase === "floor") {
                drawFloor();
            } else if (phase === "thresholds") {
                drawBlank();
                calibrationLoop();
            } else {
                drawBlank();
            }
        }, 50);

        return () => clearTimeout(timer);
    });

    $effect(() => () => clearTimers());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="calibration-screen">
    {#if cs.phase === "setup"}
        <div class="phase-content">
            <div class="phase-step">{$t("calibration.step")} {phaseStep()}</div>
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
            <div class="phase-step">{$t("calibration.step")} {phaseStep()}</div>
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
            <div class="phase-step">{$t("calibration.step")} {phaseStep()}</div>
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
                <button class="btn btn-ghost" onclick={toggleFloorVisible}>
                    {cs.floorVisible ? $t("calibration.hidePatch") : $t("calibration.showPatch")}
                </button>
                <span class="floor-gain">{$t("calibration.gain")}: {cs.floorGain.toFixed(1)}×</span>
                <div class="floor-buttons">
                    <button class="btn btn-ghost" onclick={() => adjustFloorGain(-0.2)}>−</button>
                    <button class="btn btn-ghost" onclick={() => adjustFloorGain(0.2)}>+</button>
                </div>
            </div>

            <p class="floor-hint">{$t("calibration.floorHint")}</p>

            <button class="btn btn-primary" onclick={confirmFloor}>
                {$t("calibration.next")}
            </button>
        </div>

    {:else if cs.phase === "thresholds"}
        <div class="phase-content">
            <div class="phase-step">{$t("calibration.step")} {phaseStep()}</div>
            <h2>{$t("calibration.thresholdsTitle")}</h2>
            <p class="phase-desc">{$t("calibration.thresholdsDesc")}</p>
        </div>

        <div class="overall-progress">
            <div class="overall-dots">
                <span class="dot done">✓</span>
                <span class="dot done">✓</span>
                <span class="dot done">✓</span>
                <span class="dot active">4</span>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: {(cs.currentTrial / cs.totalTrials) * 100}%"></div>
        </div>
        <div class="stats">
            <span>{$t("calibration.point")}: {cs.currentFreqIndex + 1}/{CALIBRATION_FREQUENCIES.length}</span>
            <span>{$t("calibration.threshold")}: {(cs.currentThreshold * 100).toFixed(0)}%</span>
        </div>

        <div class="canvas-wrap">
            <canvas
                bind:this={canvasEl}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                id="calCanvas"
            ></canvas>
            <div class="fixation" style="opacity: {fixationOpacity}"></div>
            {#if showFeedback}
                <div class="feedback {feedbackType}">{feedbackText}</div>
            {/if}
        </div>

        <KeyHints layout="answers" {activeKey} />

    {:else if cs.phase === "complete"}
        <div class="phase-content">
            <div class="phase-step">✓</div>
            <h2>{$t("calibration.completeTitle")}</h2>
            <p>{$t("calibration.completeDesc")}</p>
            <button class="btn btn-primary" onclick={() => goto("/")}>
                {$t("actions.home")}
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
        font-size: var(--text-xs) !important;
        padding: 4px 10px !important;
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
    .floor-gain {
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
    .progress-bar {
        width: 100%;
        height: 4px;
        background: var(--bg-tertiary);
        border-radius: 2px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: var(--accent);
        transition: width var(--duration-slow) ease;
    }
    .overall-progress {
        display: flex;
        justify-content: center;
        margin-bottom: 8px;
    }
    .overall-dots {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .dot {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs);
        font-weight: 600;
    }
    .dot.done {
        background: var(--accent);
        color: var(--text-on-accent);
    }
    .dot.active {
        background: var(--bg-tertiary);
        border: 2px solid var(--accent);
        color: var(--accent);
    }
    .stats {
        display: flex;
        gap: 20px;
        font-size: var(--text-sm);
        color: var(--text-muted);
    }
    .fixation {
        position: absolute;
        width: 20px;
        height: 20px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        transition: opacity var(--duration-fast) ease-out;
    }
    .fixation::before, .fixation::after {
        content: "";
        position: absolute;
        background: #fff;
    }
    .fixation::before {
        width: 2px;
        height: 16px;
        left: 9px;
        top: 2px;
    }
    .fixation::after {
        width: 16px;
        height: 2px;
        left: 2px;
        top: 9px;
    }
    .feedback {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        font-size: var(--text-base);
        font-weight: 600;
        padding: 5px 14px;
        pointer-events: none;
        z-index: 10;
    }
    .feedback.correct {
        background: var(--green);
        color: #000;
    }
    .feedback.wrong {
        background: var(--red);
        color: #fff;
    }
</style>
