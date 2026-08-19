<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { ORIENTATIONS, MODES } from "$lib";
    import type { Eye } from "$lib/game/types";
    import { CANVAS_SIZE, renderPatch, renderLateralMasking, showBlank } from "$lib/game/renderer";
    import { loadProfile } from "$lib/game/calibration";
    import { getAccuracy, getDifficultyDisplay } from "$lib/game/state";
    import { getKeyBinding } from "$lib/game/keyboard";
    import { createOrchestrator } from "$lib/game/orchestrator";
    import CrtOverlay from "$lib/crt-overlay.svelte";
    import KeyHints from "$lib/key-hints.svelte";
    import AnswerTiles from "$lib/AnswerTiles.svelte";
    import { triggerHaptic, getPlatform } from "$lib/game/haptics";
    import { useHaptics, useGameTimers } from "$lib/game/hooks";
    import { onMount } from "svelte";

    useHaptics();
    const timers = useGameTimers();
    const isIOS = $derived(getPlatform() === "ios");

    let canvasEl: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const gameMode = $derived($page.params.game as string);
    const isDemo = $derived(gameMode === "demo");
    const isSession = $derived($page.url.searchParams.get("session") === "true");
    const numTrials = $derived(parseInt($page.url.searchParams.get("trials") || "50"));
    const selectedEye = $derived(($page.url.searchParams.get("eye") || "both") as Eye);

    const calProfile = $derived(loadProfile());

    // UI state driven by orchestrator callbacks
    let fixationOpacity = $state(0);
    let feedbackText = $state("");
    let feedbackType = $state("correct" as "correct" | "wrong");
    let showFeedback = $state(false);
    let activeKey = $state("");
    let isPaused = $state(false);
    let resumeCountdown = $state(0);
    let sessionDisplay = $state("");
    let sessionPhaseDisplay = $state("");

    // Reactive mirrors of orchestrator state (updated via callbacks)
    let trial = $state(0);
    let numTrialsState = $state(50);
    let accuracy = $state("—");
    let difficultyDisplay = $state("");
    let invalidTrials = $state(0);
    let replayCount = $state(0);
    let maxReplays = $state(2);
    let sessionRunning = $state(false);

    const isMobile = $derived(
        typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches,
    );

    const modeConfig = $derived(
        gameMode && !isDemo ? MODES[gameMode as keyof typeof MODES] : null,
    );

    // ── Canvas rendering (DOM-specific, stays in page) ────────────────
    function showBlankCanvas() {
        if (ctx) showBlank(ctx);
    }

    function renderCurrentPatch() {
        if (!ctx || !modeConfig) return;
        const gs = orch.getState();
        if (!gs.currentTrial) return;
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
            const orient = p.orient !== undefined
                ? ORIENTATIONS[p.orient as keyof typeof ORIENTATIONS].angle
                : p.angle || 0;
            const phase = p.phase !== undefined ? p.phase : Math.random() * Math.PI * 2;
            if ("type" in p && p.type === "lateral") {
                renderLateralMasking(data, w, h, {
                    orientation: orient,
                    targetContrast: p.targetContrast,
                    flankerContrast: p.flankerContrast,
                    spatialFreq: p.spatialFreq,
                    phase,
                    sigma: p.sigma,
                    flankerDistance: p.flankerDistance,
                    cx: 150,
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
                    cx: 150,
                    cy: 150,
                    radius: 100,
                });
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function syncState() {
        const gs = orch.getState();
        trial = gs.trial;
        numTrialsState = gs.numTrials;
        accuracy = getAccuracy(gs);
        difficultyDisplay = getDifficultyDisplay(gs);
        invalidTrials = gs.invalidTrials;
        replayCount = gs.replayCount;
        maxReplays = gs.maxReplays;
        const s = orch.getSession();
        sessionRunning = !!s?.running;
    }

    // ── Orchestrator ──────────────────────────────────────────────────
    let orch = createOrchestrator(
        gameMode,
        isDemo ? 4 : numTrials,
        selectedEye,
        isDemo,
        isSession,
        {
            onFixationStart: () => {
                fixationOpacity = 1;
                showBlankCanvas();
                syncState();
            },
            onStimulusShow: () => {
                fixationOpacity = 0;
                renderCurrentPatch();
                syncState();
            },
            onBlank: () => showBlankCanvas(),
            onWaitingForResponse: () => syncState(),
            onFeedback: (correct, label) => {
                feedbackText = label;
                feedbackType = correct ? "correct" : "wrong";
                showFeedback = true;
                triggerHaptic(correct ? "success" : "error");
                syncState();
                // Auto-hide feedback
                timers.setLoopTimeout(() => { showFeedback = false; }, 700);
            },
            onDone: (results) => {
                showBlankCanvas();
                const params = new URLSearchParams($page.url.search);
                params.set("mode", gameMode);
                params.set("acc", results.accuracy);
                params.set("correct", String(results.correct));
                params.set("total", String(results.total));
                params.set("invalid", String(results.invalidTrials));
                params.set("difficulty", String(results.difficulty));
                params.set("time", String(results.elapsed));
                goto(`/results?${params.toString()}`);
            },
            onSessionUpdate: (display, phase) => {
                sessionDisplay = display;
                sessionPhaseDisplay = phase;
            },
            onPauseChange: (paused) => {
                isPaused = paused;
                if (paused) showBlankCanvas();
            },
        },
        {
            setLoopTimeout: (fn, ms) => timers.setLoopTimeout(fn, ms),
            setResumeInterval: (fn, ms) => timers.setResumeInterval(fn, ms),
            clearTimers: () => timers.clearTimers(),
        },
        calProfile,
    );

    // ── Input handling ────────────────────────────────────────────────
    function togglePause() {
        if (isPaused) {
            resumeCountdown = 3;
            orch.resume(() => {
                if (orch.getState().waitingForResponse) renderCurrentPatch();
            });
        } else {
            orch.pause();
        }
    }

    function onKeydown(e: KeyboardEvent) {
        const code = e.code;
        if (code === "Escape" || (code === "Space" && !orch.getState().waitingForResponse)) {
            e.preventDefault();
            togglePause();
            return;
        }
        if (isPaused && (code === "Enter" || code === "Space")) {
            e.preventDefault();
            togglePause();
            return;
        }
        const gs = orch.getState();
        if (!gs.running || !gs.waitingForResponse || isPaused) return;
        if (!modeConfig) return;
        if (code === "KeyR") {
            e.preventDefault();
            orch.handleRepeat();
            return;
        }
        const key = getKeyBinding(e, modeConfig.type as "4afc" | "2afc");
        if (!key) return;
        e.preventDefault();
        activeKey = key === "skip" ? "" : key;
        setTimeout(() => { activeKey = ""; }, 300);
        if (key === "skip") orch.handleSkip();
        else orch.handleAnswer(key);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────
    onMount(() => {
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && orch.getState().running && !isPaused && !isDemo) {
                orch.pause();
            }
        });
    });

    $effect(() => {
        if (!canvasEl) return;
        ctx = canvasEl.getContext("2d")!;
        showBlankCanvas();
        orch = createOrchestrator(
            gameMode, isDemo ? 4 : numTrials, selectedEye, isDemo, isSession,
            {
                onFixationStart: () => { fixationOpacity = 1; showBlankCanvas(); syncState(); },
                onStimulusShow: () => { fixationOpacity = 0; renderCurrentPatch(); syncState(); },
                onBlank: () => showBlankCanvas(),
                onWaitingForResponse: () => syncState(),
                onFeedback: (correct, label) => {
                    feedbackText = label;
                    feedbackType = correct ? "correct" : "wrong";
                    showFeedback = true;
                    triggerHaptic(correct ? "success" : "error");
                    syncState();
                    timers.setLoopTimeout(() => { showFeedback = false; }, 700);
                },
                onDone: (results) => {
                    showBlankCanvas();
                    const params = new URLSearchParams($page.url.search);
                    params.set("mode", gameMode);
                    params.set("acc", results.accuracy);
                    params.set("correct", String(results.correct));
                    params.set("total", String(results.total));
                    params.set("invalid", String(results.invalidTrials));
                    params.set("difficulty", String(results.difficulty));
                    params.set("time", String(results.elapsed));
                    goto(`/results?${params.toString()}`);
                },
                onSessionUpdate: (display, phase) => {
                    sessionDisplay = display;
                    sessionPhaseDisplay = phase;
                },
                onPauseChange: (paused) => {
                    isPaused = paused;
                    if (paused) showBlankCanvas();
                },
            },
            {
                setLoopTimeout: (fn, ms) => timers.setLoopTimeout(fn, ms),
                setResumeInterval: (fn, ms) => timers.setResumeInterval(fn, ms),
                clearTimers: () => timers.clearTimers(),
            },
            calProfile,
        );
        orch.start();
    });

    $effect(() => () => timers.clearTimers());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="game-screen">
    <div id="topBar">
        <button class="btn btn-ghost pause-btn" onclick={togglePause}>
            {isPaused ? "▶" : "⏸"}
        </button>
        <div class="progress-track">
            <div class="progress-fill" style="width: {(trial / numTrialsState) * 100}%"></div>
        </div>
        <div class="trial-counter">{trial} / {numTrialsState}</div>
    </div>
    {#if selectedEye !== "both"}
        <div class="eye-instruction">
            {$t(selectedEye === "left" ? "eye.instructionLeft" : "eye.instructionRight")}
        </div>
    {/if}
    {#if modeConfig?.instruction && trial <= 1 && !isPaused}
        <div class="instruction-text">{modeConfig.instruction}</div>
    {/if}
    <div class="hud">
        <span class="hud-stat"
            >{$t("game.accuracy")}: <b>{accuracy}</b></span
        >
        <span class="hud-diff">{difficultyDisplay}</span>
        {#if invalidTrials > 0}
            <span class="hud-invalid">skip: {invalidTrials}</span>
        {/if}
        {#if sessionRunning}
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
                    <button class="btn btn-primary" onclick={togglePause}>
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
                onAnswer={(k) => orch.handleAnswer(k)}
                onSkip={() => orch.handleSkip()}
                onRepeat={() => orch.handleRepeat()}
                canRepeat={replayCount < maxReplays}
                {isIOS}
                modeType={modeConfig?.type as "4afc" | "2afc"}
            />
        {:else}
            <div class="desktop-controls">
                <KeyHints layout="answers" onKey={(k) => orch.handleAnswer(k)} {activeKey} modeType={modeConfig?.type as "4afc" | "2afc"} />
                <div class="replay-hint">
                    <kbd>R</kbd> replay ({maxReplays - replayCount} left)
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
    .instruction-text {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        text-align: center;
        padding: 6px 12px;
        background: var(--bg-tertiary);
        border-radius: var(--radius);
        margin-bottom: 4px;
        border: 1px solid var(--border);
    }
</style>
