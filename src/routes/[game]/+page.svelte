<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { ORIENTATIONS, MODES } from "$lib";
    import type { OrientKey } from "$lib/game/types";
    import { CANVAS_SIZE, renderPatch, renderLateralMasking, showBlank } from "$lib/game/renderer";
    import {
        createGameState,
        nextTrial,
        processAnswer,
        skipTrial,
        getAccuracy,
        getDifficultyDisplay,
        getProgress,
        getCorrectAnswerLabel,
        updateStimulusDuration,
    } from "$lib/game/state";
    import {
        createSessionState,
        updateSessionTimer,
        shouldAdvancePhase,
        advanceSessionPhase,
        getProgressPercent,
        formatTime,
        getSessionSummary,
        type SessionState,
    } from "$lib/game/session";
    import { getKeyBinding } from "$lib/game/keyboard";
    import CrtOverlay from "$lib/crt-overlay.svelte";
    import KeyHints from "$lib/key-hints.svelte";
    import PixelIcon from "$lib/pixel-icons.svelte";
    import AnswerTiles from "$lib/AnswerTiles.svelte";
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

    const isIOS = $derived(getPlatform() === "ios");

    let canvasEl: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const gameMode = $derived($page.params.game as string);
    const isDemo = $derived(gameMode === "demo");
    const isSession = $derived($page.url.searchParams.get("session") === "true");
    const numTrials = $derived(
        parseInt($page.url.searchParams.get("trials") || "50"),
    );

    let gs: ReturnType<typeof createGameState> = createGameState("classic", 50);
    let session: SessionState | null = $state(null);
    let sessionDisplay = $state("");
    let sessionPhaseDisplay = $state("");

    $effect(() => {
        gs = isDemo
            ? createGameState("classic", 4)
            : createGameState(gameMode, numTrials);
        if (isSession && !isDemo) {
            session = createSessionState();
        } else {
            session = null;
        }
    });

    let feedbackText = $state("");
    let feedbackType = $state("correct" as "correct" | "wrong");
    let showFeedback = $state(false);
    let canRepeat = $state(true);
    let activeKey = $state("");

    const modeConfig = $derived(
        gameMode && !isDemo ? MODES[gameMode as keyof typeof MODES] : null,
    );

    const demoOrients: OrientKey[] = ["horiz", "diag1", "vert", "diag2"];
    let demoIndex = $state(0);
    let demoLabel = $state("");
    let fixationOpacity = $state(0);

    let loopTimeout: ReturnType<typeof setTimeout> | null = null;

    const isMobile = $derived(
        typeof window !== "undefined" &&
            window.matchMedia("(max-width: 600px)").matches,
    );

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
        if (!ctx || !gs.currentTrial || !modeConfig) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = 128;
            data[i + 3] = 255;
        }
        const is2afc = modeConfig.type === "2afc";
        for (let i = 0; i < gs.currentTrial.patches.length; i++) {
            const p = gs.currentTrial.patches[i];
            const orient =
                p.orient !== undefined
                    ? ORIENTATIONS[p.orient as keyof typeof ORIENTATIONS].angle
                    : p.angle || 0;
            const phase =
                p.phase !== undefined ? p.phase : Math.random() * Math.PI * 2;

            if ("type" in p && p.type === "lateral") {
                renderLateralMasking(data, w, h, {
                    orientation: orient,
                    targetContrast: p.targetContrast,
                    flankerContrast: p.flankerContrast,
                    spatialFreq: p.spatialFreq,
                    phase,
                    sigma: p.sigma,
                    flankerDistance: p.flankerDistance,
                    cx: is2afc ? (i === 0 ? 85 : 215) : 150,
                    cy: 150,
                });
            } else {
                const patch = p as { contrast?: number; spatialFreq?: number; sigma?: number; noise?: number };
                renderPatch(data, w, h, {
                    orientation: orient,
                    contrast: patch.contrast ?? 0.8,
                    spatialFreq: patch.spatialFreq ?? 0.04,
                    sigma: patch.sigma ?? 30,
                    noise: patch.noise || 0,
                    phase,
                    cx: is2afc ? (i === 0 ? 85 : 215) : 150,
                    cy: 150,
                    radius: is2afc ? 65 : 100,
                });
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function renderDemoPatch(orientKey: OrientKey) {
        if (!ctx) return;
        const w = CANVAS_SIZE;
        const h = CANVAS_SIZE;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = 128;
            data[i + 3] = 255;
        }
        renderPatch(data, w, h, {
            orientation: ORIENTATIONS[orientKey].angle,
            contrast: 0.8,
            spatialFreq: 0.04,
            sigma: 30,
            phase: 0,
            cx: 150,
            cy: 150,
            radius: 100,
        });
        ctx.putImageData(imageData, 0, 0);
    }

    function demoLoop() {
        if (!isDemo || demoIndex >= demoOrients.length) {
            setTimeout(() => goto("/"), 1500);
            return;
        }
        const key = demoOrients[demoIndex];
        const o = ORIENTATIONS[key];
        demoLabel = o.symbol + " " + $t(o.labelKey);
        showBlankCanvas();
        loopTimeout = setTimeout(() => {
            renderDemoPatch(key);
            demoIndex++;
            loopTimeout = setTimeout(demoLoop, 1500);
        }, 400);
    }

    function handleRepeat() {
        if (!gs.waitingForResponse || !canRepeat) return;
        canRepeat = false;
        renderCurrentTrial();
        triggerHaptic("nudge");
    }

    function gameLoop() {
        if (!gs.running) return;

        if (session && session.running) {
            updateSessionTimer(session);
            sessionDisplay = formatTime(session.elapsed);
            sessionPhaseDisplay = session.phase;

            if (session.elapsed >= 30 * 60 * 1000) {
                session.phase = 'complete';
                session.running = false;
                endTraining();
                return;
            }

            if (shouldAdvancePhase(session)) {
                advanceSessionPhase(session);
            }
        }

        if (gs.phase === "fixation") {
            fixationOpacity = 1;
            canRepeat = true;
            showBlankCanvas();
            loopTimeout = setTimeout(() => {
                fixationOpacity = 0;
                gs.phase = "stimulus";
                renderCurrentTrial();

                loopTimeout = setTimeout(() => {
                    showBlankCanvas();
                    loopTimeout = setTimeout(() => {
                        gs.waitingForResponse = true;
                        gs.phase = "waiting";
                    }, gs.isi);
                }, gs.stimulusDuration);
            }, 300);
        } else if (gs.phase === "feedback") {
            loopTimeout = setTimeout(() => {
                showFeedback = false;
                nextTrial(gs);
                updateStimulusDuration(gs);
                if (gs.phase === "done") {
                    endTraining();
                } else {
                    gameLoop();
                }
            }, 700);
        } else if (gs.phase === "done") {
            endTraining();
        }
    }

    function handleAnswer(key: string) {
        if (!gs.waitingForResponse || !gs.running) return;
        processAnswer(gs, key);
        if (gs.lastAnswerCorrect) {
            feedbackText = "✓";
            feedbackType = "correct";
            triggerHaptic("success");
        } else {
            feedbackText = "✗ → " + getCorrectAnswerLabel(gs);
            feedbackType = "wrong";
            triggerHaptic("error");
        }
        showFeedback = true;
        gameLoop();
    }

    function handleSkip() {
        if (!gs.waitingForResponse || !gs.running) return;
        triggerHaptic("nudge");
        skipTrial(gs);
        gameLoop();
    }

    function onKeydown(e: KeyboardEvent) {
        if (!gs.running || !gs.waitingForResponse) return;
        if (!modeConfig) return;
        const key = getKeyBinding(e, modeConfig.type as "4afc" | "2afc");
        if (!key) return;
        e.preventDefault();
        activeKey = key === "skip" ? "" : key;
        setTimeout(() => { activeKey = ""; }, 300);
        if (key === "skip") handleSkip();
        else handleAnswer(key);
    }

    function endTraining() {
        gs.running = false;
        showBlankCanvas();
        const params = new URLSearchParams($page.url.search);
        params.set("mode", gameMode);
        params.set("acc", getAccuracy(gs));
        params.set("correct", String(gs.correct));
        params.set("total", String(gs.total));
        params.set("difficulty", String(gs.difficulty));
        params.set(
            "time",
            String(Math.round((Date.now() - gs.startTime) / 1000)),
        );
        goto(`/results?${params.toString()}`);
    }

    $effect(() => {
        if (!canvasEl) return;
        ctx = canvasEl.getContext("2d")!;
        showBlankCanvas();
        if (isDemo) {
            demoLoop();
        } else {
            nextTrial(gs);
            gameLoop();
        }
    });

    $effect(() => () => clearTimers());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="game-screen">
    <div id="topBar">
        <div class="progress-track">
            <div class="progress-fill" style="width: {getProgress(gs)}%"></div>
        </div>
        <div class="trial-counter">{gs.trial} / {gs.numTrials}</div>
    </div>
    <div class="hud">
        <span class="hud-stat"
            >{$t("game.accuracy")}: <b>{getAccuracy(gs)}</b></span
        >
        <span class="hud-diff">{getDifficultyDisplay(gs)}</span>
        {#if session && session.running}
            <span class="hud-session">{sessionDisplay}</span>
            <span class="hud-phase">{sessionPhaseDisplay}</span>
        {/if}
    </div>

    <div class="canvas-wrap">
        <canvas
            bind:this={canvasEl}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            id="gaborCanvas"
        ></canvas>
        <div id="fixation" style="opacity: {fixationOpacity}"></div>
        {#if showFeedback}
            <div id="feedbackLabel" class="show {feedbackType}">
                {feedbackText}
            </div>
        {/if}
        <CrtOverlay />
    </div>

    {#if !isDemo}
        {#if isMobile}
            <AnswerTiles
                onAnswer={handleAnswer}
                onSkip={handleSkip}
                onRepeat={handleRepeat}
                {canRepeat}
                {isIOS}
            />
        {:else}
            <KeyHints layout="answers" onKey={handleAnswer} {activeKey} />
        {/if}
    {/if}
</div>

<style>
    .game-screen {
        width: 100%;
        max-width: 600px;
        padding: 0 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #topBar {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
    }
    .progress-track {
        flex: 1;
        height: 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 3px;
        transition: width var(--duration-slow) ease;
    }
    .trial-counter {
        font-size: var(--text-sm);
        color: var(--text-muted);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
    .hud {
        display: flex;
        gap: 20px;
        font-size: var(--text-base);
        color: var(--text-secondary);
        font-variant-numeric: tabular-nums;
        margin-bottom: 4px;
    }
    .hud-stat b {
        color: var(--text-primary);
    }
    .hud-diff {
        color: var(--accent);
    }
    .hud-session {
        color: var(--text-primary);
        font-weight: 600;
    }
    .hud-phase {
        color: var(--text-muted);
        font-size: var(--text-xs);
        text-transform: capitalize;
    }
    #gaborCanvas {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
    }
    #fixation {
        position: absolute;
        width: 20px;
        height: 20px;
        pointer-events: none;
        transition: opacity var(--duration-fast) ease-out;
        z-index: 5;
    }
    #fixation::before,
    #fixation::after {
        content: "";
        position: absolute;
        background: #fff;
    }
    #fixation::before {
        width: 2px;
        height: 16px;
        left: 9px;
        top: 2px;
    }
    #fixation::after {
        width: 16px;
        height: 2px;
        left: 2px;
        top: 9px;
    }
    #feedbackLabel {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        font-size: var(--text-base);
        font-weight: 600;
        padding: 5px 14px;
        opacity: 0;
        pointer-events: none;
        z-index: 10;
        transition: opacity var(--duration-normal) ease-out;
    }
    #feedbackLabel.show {
        opacity: 1;
    }
    #feedbackLabel.correct {
        background: var(--green);
        color: #000;
    }
    #feedbackLabel.wrong {
        background: var(--red);
        color: #fff;
    }
    @media (max-width: 600px) {
        .hud {
            gap: 12px;
            font-size: var(--text-xs);
            margin-bottom: 2px;
        }
        #topBar {
            gap: 8px;
            padding: 4px 0;
        }
    }
</style>
