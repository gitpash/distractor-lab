<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { ORIENTATIONS, MODES } from "$lib";
    import type { OrientKey, Eye } from "$lib/game/types";
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
    const selectedEye = $derived(
        ($page.url.searchParams.get("eye") || "both") as Eye,
    );

    let gs: ReturnType<typeof createGameState> = createGameState("classic", 50);
    let session: SessionState | null = $state(null);
    let sessionDisplay = $state("");
    let sessionPhaseDisplay = $state("");

    $effect(() => {
        gs = isDemo
            ? createGameState("classic", 4)
            : createGameState(gameMode, numTrials, selectedEye);
        if (isSession && !isDemo) {
            session = createSessionState();
        } else {
            session = null;
        }
    });

    let feedbackText = $state("");
    let feedbackType = $state("correct" as "correct" | "wrong");
    let showFeedback = $state(false);
    let activeKey = $state("");

    // Pause state
    let isPaused = $state(false);
    let resumeCountdown = $state(0);
    let resumeInterval: ReturnType<typeof setInterval> | null = null;

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
        if (resumeInterval) {
            clearInterval(resumeInterval);
            resumeInterval = null;
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
        if (!gs.waitingForResponse || gs.replayCount >= gs.maxReplays) return;
        gs.replayCount++;
        renderCurrentTrial();
        triggerHaptic("nudge");
    }

    // ── Pause system ────────────────────────────────────────────────
    function togglePause() {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }

    function pauseGame() {
        if (isPaused || !gs.running) return;
        isPaused = true;
        gs.paused = true;
        clearTimers();
        showBlankCanvas();
        triggerHaptic("nudge");
    }

    function resumeGame() {
        if (!isPaused) return;
        resumeCountdown = 3;
        resumeInterval = setInterval(() => {
            resumeCountdown--;
            if (resumeCountdown <= 0) {
                if (resumeInterval) clearInterval(resumeInterval);
                resumeInterval = null;
                isPaused = false;
                gs.paused = false;
                // Re-render current trial if we were waiting
                if (gs.waitingForResponse) {
                    renderCurrentTrial();
                }
                gameLoop();
            }
        }, 800);
    }

    // Auto-pause on visibility change
    function handleVisibilityChange() {
        if (document.hidden && gs.running && !isPaused && !isDemo) {
            pauseGame();
        }
    }

    onMount(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    });

    function gameLoop() {
        if (!gs.running || isPaused) return;

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
            gs.replayCount = 0;
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
        if (!gs.waitingForResponse || !gs.running || isPaused) return;
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
        if (!gs.waitingForResponse || !gs.running || isPaused) return;
        triggerHaptic("nudge");
        skipTrial(gs);
        gameLoop();
    }

    function onKeydown(e: KeyboardEvent) {
        // Pause toggle with Escape or Space
        if (e.key === "Escape" || (e.key === " " && !gs.waitingForResponse)) {
            e.preventDefault();
            togglePause();
            return;
        }

        // Resume with Enter/Space when paused
        if (isPaused && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            resumeGame();
            return;
        }

        if (!gs.running || !gs.waitingForResponse || isPaused) return;
        if (!modeConfig) return;

        // R key for replay
        if (e.key === "r" || e.key === "R") {
            e.preventDefault();
            handleRepeat();
            return;
        }

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
        params.set("invalid", String(gs.invalidTrials));
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
        <button class="btn btn-ghost pause-btn" onclick={togglePause}>
            {isPaused ? "▶" : "⏸"}
        </button>
        <div class="progress-track">
            <div class="progress-fill" style="width: {getProgress(gs)}%"></div>
        </div>
        <div class="trial-counter">{gs.trial} / {gs.numTrials}</div>
    </div>
    {#if selectedEye !== "both"}
        <div class="eye-instruction">
            {$t(selectedEye === "left" ? "eye.instructionLeft" : "eye.instructionRight")}
        </div>
    {/if}
    <div class="hud">
        <span class="hud-stat"
            >{$t("game.accuracy")}: <b>{getAccuracy(gs)}</b></span
        >
        <span class="hud-diff">{getDifficultyDisplay(gs)}</span>
        {#if gs.invalidTrials > 0}
            <span class="hud-invalid">skip: {gs.invalidTrials}</span>
        {/if}
        {#if session && session.running}
            <span class="hud-session">{sessionDisplay}</span>
            <span class="hud-phase">{sessionPhaseDisplay}</span>
        {/if}
    </div>

    <div class="canvas-wrap" class:paused={isPaused}>
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
        {#if isPaused}
            <div class="pause-overlay">
                {#if resumeCountdown > 0}
                    <div class="resume-countdown">{resumeCountdown}</div>
                {:else}
                    <div class="pause-label">⏸ {$t("game.paused")}</div>
                    <button class="btn btn-primary" onclick={resumeGame}>
                        {$t("game.resume")}
                    </button>
                {/if}
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
                canRepeat={gs.replayCount < gs.maxReplays}
                {isIOS}
            />
        {:else}
            <div class="desktop-controls">
                <KeyHints layout="answers" onKey={handleAnswer} {activeKey} />
                <div class="replay-hint">
                    <kbd>R</kbd> replay ({gs.maxReplays - gs.replayCount} left)
                </div>
            </div>
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
        gap: 8px;
        padding: 4px 0;
    }
    .pause-btn {
        font-size: var(--text-base);
        padding: 4px 8px;
        min-width: 32px;
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
        gap: 16px;
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
    .hud-invalid {
        color: var(--text-muted);
        font-size: var(--text-xs);
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
    .canvas-wrap {
        position: relative;
        width: min(70vw, 70vh, 320px);
        height: min(70vw, 70vh, 320px);
        background: var(--bg-tertiary);
        border-radius: var(--radius);
        overflow: hidden;
        transition: opacity var(--duration-normal) ease;
    }
    .canvas-wrap.paused {
        opacity: 0.3;
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
    .pause-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.85);
        border-radius: var(--radius);
        z-index: 20;
        gap: 12px;
    }
    .pause-label {
        font-size: var(--text-lg);
        color: var(--text-primary);
        font-weight: 600;
    }
    .resume-countdown {
        font-size: 3rem;
        color: var(--accent);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        animation: pulse 0.8s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    .desktop-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    .replay-hint {
        font-size: var(--text-xs);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .replay-hint kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: 3px;
        font-family: inherit;
        font-size: 0.65rem;
        color: var(--text-secondary);
        line-height: 1;
    }
    @media (max-width: 600px) {
        .hud {
            gap: 10px;
            font-size: var(--text-xs);
            margin-bottom: 2px;
        }
        #topBar {
            gap: 6px;
            padding: 4px 0;
        }
        .canvas-wrap {
            width: min(85vw, 85vh, 360px);
            height: min(85vw, 85vh, 360px);
        }
    }
    .eye-instruction {
        font-size: var(--text-sm);
        color: var(--accent);
        text-align: center;
        padding: 6px 12px;
        background: var(--bg-tertiary);
        border-radius: var(--radius);
        margin-bottom: 4px;
        border: 1px solid var(--accent-dim);
    }
</style>
