<script lang="ts">
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { ORIENTATIONS } from "$lib";
    import type { OrientKey } from "$lib/game/types";
    import { CANVAS_SIZE, renderPatch, showBlank } from "$lib/game/renderer";
    import {
        createCalibrationState,
        getCurrentCalibrationFreq,
        getCurrentCalibrationOrient,
        buildCalibrationTrial,
        processCalibrationAnswer,
        getCalibrationProfile,
        formatSpatialFreq,
        CALIBRATION_FREQUENCIES,
        CALIBRATION_ORIENTATIONS,
    } from "$lib/game/calibration";
    import { getKeyBinding } from "$lib/game/keyboard";
    import {
        initHaptics,
        triggerHaptic,
        destroyHaptics,
        getPlatform,
    } from "$lib/game/haptics";
    import { onMount } from "svelte";

    onMount(() => {
        initHaptics();
        return () => destroyHaptics();
    });

    let canvasEl: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let cs = createCalibrationState();
    let fixationOpacity = $state(0);
    let showFeedback = $state(false);
    let feedbackText = $state("");
    let feedbackType = $state("correct" as "correct" | "wrong");
    let activeKey = $state("");

    let loopTimeout: ReturnType<typeof setTimeout> | null = null;

    function clearTimers() {
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }
    }

    function showBlankCanvas() {
        if (ctx) showBlank(ctx);
    }

    function renderCurrentTrial() {
        if (!ctx || !cs.running) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = ctx.createImageData(w, h);
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
            sigma: 30,
            noise: 0,
            phase,
            cx: 150,
            cy: 150,
            radius: 100,
        });

        ctx.putImageData(imageData, 0, 0);
    }

    function calibrationLoop() {
        if (!cs.running) return;
        if (cs.phase === "intro") {
            showBlankCanvas();
            return;
        }
        if (cs.phase === "running") {
            fixationOpacity = 1;
            showBlankCanvas();
            loopTimeout = setTimeout(() => {
                fixationOpacity = 0;
                renderCurrentTrial();
                cs.waitingForResponse = true;
            }, 300);
        }
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
        if (!cs.running || !cs.waitingForResponse) return;
        const key = getKeyBinding(e, "4afc");
        if (!key) return;
        e.preventDefault();
        activeKey = key;
        setTimeout(() => { activeKey = ""; }, 300);
        handleAnswer(key);
    }

    function endCalibration() {
        cs.running = false;
        showBlankCanvas();
        const profile = getCalibrationProfile(cs);
        // Store profile in sessionStorage for use in training
        sessionStorage.setItem('calibrationProfile', JSON.stringify(profile));
        goto("/results?mode=calibration");
    }

    function startCalibration() {
        cs = createCalibrationState();
        cs.phase = "running";
        calibrationLoop();
    }

    $effect(() => {
        if (!canvasEl) return;
        ctx = canvasEl.getContext("2d")!;
        showBlankCanvas();
    });

    $effect(() => () => clearTimers());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="calibration-screen">
    {#if cs.phase === "intro"}
        <div class="intro-content">
            <h2>{$t("calibration.title")}</h2>
            <p>{$t("calibration.description")}</p>
            <div class="calibration-info">
                <span>{$t("calibration.frequencies")}: {CALIBRATION_FREQUENCIES.length}</span>
                <span>{$t("calibration.orientations")}: {CALIBRATION_ORIENTATIONS.length}</span>
                <span>{$t("calibration.total")}: {cs.totalTrials} {$t("calibration.trials")}</span>
            </div>
            <button class="btn btn-primary" onclick={startCalibration}>
                {$t("actions.start")}
            </button>
        </div>
    {:else}
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
            ></canvas>
            <div class="fixation" style="opacity: {fixationOpacity}"></div>
            {#if showFeedback}
                <div class="feedback {feedbackType}">{feedbackText}</div>
            {/if}
        </div>

        <div class="key-hints">
            <span class:active={activeKey === "horiz"}>A — {ORIENTATIONS.horiz.symbol}</span>
            <span class:active={activeKey === "diag1"}>S — {ORIENTATIONS.diag1.symbol}</span>
            <span class:active={activeKey === "vert"}>D — {ORIENTATIONS.vert.symbol}</span>
            <span class:active={activeKey === "diag2"}>F — {ORIENTATIONS.diag2.symbol}</span>
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
    .intro-content {
        text-align: center;
        max-width: 400px;
    }
    .intro-content h2 {
        font-size: 20px;
        font-weight: 700;
        color: var(--accent);
        margin-bottom: 8px;
    }
    .intro-content p {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 16px;
    }
    .calibration-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 20px;
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
        transition: width 0.2s;
    }
    .stats {
        display: flex;
        gap: 20px;
        font-size: 12px;
        color: var(--text-muted);
    }
    .canvas-wrap {
        position: relative;
        width: min(80vw, 400px);
        aspect-ratio: 1;
        background: #808080;
    }
    .canvas-wrap canvas {
        width: 100%;
        height: 100%;
    }
    .fixation {
        position: absolute;
        width: 20px;
        height: 20px;
        pointer-events: none;
        transition: opacity 0.1s;
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
        font-size: 13px;
        font-weight: 600;
        padding: 5px 14px;
        pointer-events: none;
    }
    .feedback.correct {
        background: rgba(0, 255, 136, 0.9);
        color: #000;
    }
    .feedback.wrong {
        background: rgba(255, 64, 96, 0.9);
        color: #fff;
    }
    .key-hints {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--text-muted);
    }
    .key-hints span.active {
        color: var(--accent);
    }
    .btn {
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        text-decoration: none;
        font-family: inherit;
    }
    .btn-primary {
        background: var(--accent-dim);
        color: #fff;
        font-size: 14px;
        padding: 12px 40px;
        border: 1px solid var(--accent);
        box-shadow: 0 0 10px var(--accent-glow);
    }
    .btn-primary:hover {
        background: var(--accent);
        color: var(--bg-primary);
    }
</style>
