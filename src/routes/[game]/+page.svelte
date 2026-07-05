<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { ORIENTATIONS, MODES } from "$lib";
    import type { OrientKey } from "$lib/game/types";
    import { CANVAS_SIZE, renderPatch, showBlank } from "$lib/game/renderer";
    import {
        createGameState,
        nextTrial,
        processAnswer,
        skipTrial,
        getAccuracy,
        getDifficultyDisplay,
        getProgress,
        getCorrectAnswerLabel,
    } from "$lib/game/state";
    import { getKeyBinding } from "$lib/game/keyboard";
    import CrtOverlay from "$lib/crt-overlay.svelte";
    import KeyHints from "$lib/key-hints.svelte";
    import PixelIcon from "$lib/pixel-icons.svelte";
    import { createWebHaptics } from "web-haptics/svelte";
    import { onDestroy } from "svelte";

    const haptics = createWebHaptics();
    onDestroy(haptics.destroy);

    let canvasEl: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const gameMode = $derived($page.params.game as string);
    const isDemo = $derived(gameMode === "demo");
    const numTrials = $derived(
        parseInt($page.url.searchParams.get("trials") || "50")
    );

    let gs: ReturnType<typeof createGameState> = createGameState("classic", 50);

    $effect(() => {
        gs = isDemo
            ? createGameState("classic", 4)
            : createGameState(gameMode, numTrials);
    });

    let feedbackText = $state("");
    let feedbackType = $state("correct" as "correct" | "wrong");
    let showFeedback = $state(false);

    const modeConfig = $derived(
        gameMode && !isDemo ? MODES[gameMode as keyof typeof MODES] : null
    );

    const demoOrients: OrientKey[] = ["horiz", "diag1", "vert", "diag2"];
    let demoIndex = $state(0);
    let demoLabel = $state("");
    let fixationOpacity = $state(0);

    let loopTimeout: ReturnType<typeof setTimeout> | null = null;

    const isMobile = $derived(typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches);

    function clearTimers() {
        if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
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
            const orient = p.orient !== undefined
                ? ORIENTATIONS[p.orient as keyof typeof ORIENTATIONS].angle
                : p.angle || 0;
            const phase = p.phase !== undefined ? p.phase : Math.random() * Math.PI * 2;
            renderPatch(data, w, h, {
                orientation: orient,
                contrast: p.contrast ?? 0.8,
                spatialFreq: p.spatialFreq ?? 0.04,
                sigma: p.sigma ?? 30,
                noise: p.noise || 0,
                phase,
                cx: is2afc ? (i === 0 ? 85 : 215) : 150,
                cy: 150,
                radius: is2afc ? 65 : 100,
            });
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
            contrast: 0.8, spatialFreq: 0.04, sigma: 30, phase: 0,
            cx: 150, cy: 150, radius: 100,
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

    function gameLoop() {
        if (!gs.running) return;
        if (gs.phase === "fixation") {
            fixationOpacity = 1;
            showBlankCanvas();
            loopTimeout = setTimeout(() => {
                fixationOpacity = 0;
                gs.phase = "stimulus";
                renderCurrentTrial();
                loopTimeout = setTimeout(() => {
                    showBlankCanvas();
                    gs.waitingForResponse = true;
                    gs.phase = "waiting";
                }, 200);
            }, 300);
        } else if (gs.phase === "feedback") {
            loopTimeout = setTimeout(() => {
                showFeedback = false;
                nextTrial(gs);
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
            haptics.trigger("success");
        } else {
            feedbackText = "✗ → " + getCorrectAnswerLabel(gs);
            feedbackType = "wrong";
            haptics.trigger("error");
        }
        showFeedback = true;
        gameLoop();
    }

    function handleSkip() {
        if (!gs.waitingForResponse || !gs.running) return;
        haptics.trigger("nudge");
        skipTrial(gs);
        gameLoop();
    }

    function onKeydown(e: KeyboardEvent) {
        if (!gs.running || !gs.waitingForResponse) return;
        if (!modeConfig) return;
        const key = getKeyBinding(e, modeConfig.type as "4afc" | "2afc");
        if (!key) return;
        e.preventDefault();
        if (key === "skip") handleSkip(); else handleAnswer(key);
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
        params.set("time", String(Math.round((Date.now() - gs.startTime) / 1000)));
        goto(`/results?${params.toString()}`);
    }

    $effect(() => {
        if (!canvasEl) return;
        ctx = canvasEl.getContext("2d")!;
        showBlankCanvas();
        if (isDemo) { demoLoop(); } else { nextTrial(gs); gameLoop(); }
    });

    $effect(() => () => clearTimers());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="game-screen">
    {#if isDemo}
        <div id="topBar">
            <div class="mode-badge">◎ {$t("actions.demo")}</div>
            <div class="progress-track">
                <div class="progress-fill" style="width: {(demoIndex / demoOrients.length) * 100}%"></div>
            </div>
            <div class="trial-counter">{demoIndex} / {demoOrients.length}</div>
        </div>
        <div class="hud"><span class="hud-stat">{demoLabel}</span></div>
    {:else}
        <div id="topBar">
            <div class="mode-badge">
                <PixelIcon name={gameMode as any} active />
                {modeConfig?.title || gameMode}
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: {getProgress(gs)}%"></div>
            </div>
            <div class="trial-counter">{gs.trial} / {gs.numTrials}</div>
        </div>
        <div class="hud">
            <span class="hud-stat">{$t("game.accuracy")}: <b>{getAccuracy(gs)}</b></span>
            <span class="hud-diff">{getDifficultyDisplay(gs)}</span>
        </div>
    {/if}

    <div id="canvasWrap">
        <canvas bind:this={canvasEl} width={CANVAS_SIZE} height={CANVAS_SIZE} id="gaborCanvas"></canvas>
        <div id="fixation" style="opacity: {fixationOpacity}"></div>
        {#if showFeedback}
            <div id="feedbackLabel" class="show {feedbackType}">{feedbackText}</div>
        {/if}
        <CrtOverlay intensity={0.2} />
    </div>

    {#if !isDemo}
        {#if isMobile}
            <div class="answer-tiles">
                {#each [
                    { key: "horiz", arrow: "←", letters: "A/D", label: $t("orientations.horiz") },
                    { key: "diag1", arrow: "↑", letters: "E", label: $t("orientations.diag1") },
                    { key: "vert", arrow: "↓", letters: "W/S", label: $t("orientations.vert") },
                    { key: "diag2", arrow: "→", letters: "Q", label: $t("orientations.diag2") },
                ] as tile}
                    <button class="answer-tile" onclick={() => handleAnswer(tile.key)}>
                        <span class="tile-arrow">{tile.arrow}</span>
                        <span class="tile-letters">{tile.letters}</span>
                        <span class="tile-label">{tile.label}</span>
                    </button>
                {/each}
                <button class="answer-tile skip" onclick={handleSkip}>{$t("actions.skip")}</button>
            </div>
        {:else}
            <KeyHints layout="answers" />
        {/if}
    {/if}
</div>

<style>
    .game-screen { width: 100%; max-width: 600px; padding: 0 16px; display: flex; flex-direction: column; align-items: center; }
    #topBar { width: 100%; display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .mode-badge { background: var(--accent-dim); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
    .mode-badge :global(.pixel-icon) { width: 16px; height: 16px; margin: 0; image-rendering: auto; shape-rendering: crispEdges; }
    .progress-track { flex: 1; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.2s; }
    .trial-counter { font-size: 12px; color: var(--text-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .hud { display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary); font-variant-numeric: tabular-nums; margin-bottom: 4px; }
    .hud-stat b { color: var(--text-primary); }
    .hud-diff { color: var(--accent); }
    #canvasWrap { position: relative; width: min(80vw, 80vh, 400px); aspect-ratio: 1; background: #808080; display: flex; align-items: center; justify-content: center; margin: 8px 0; overflow: hidden; }
    @media (max-width: 600px) {
        #canvasWrap { width: min(85vw, 50vh, 300px); margin: 4px 0; }
        .hud { gap: 12px; font-size: 11px; margin-bottom: 2px; }
        #topBar { gap: 8px; padding: 4px 0; }
    }
    #gaborCanvas { width: 100%; height: 100%; image-rendering: pixelated; }
    #fixation { position: absolute; width: 20px; height: 20px; pointer-events: none; transition: opacity 0.1s; z-index: 5; }
    #fixation::before, #fixation::after { content: ""; position: absolute; background: #fff; }
    #fixation::before { width: 2px; height: 16px; left: 9px; top: 2px; }
    #fixation::after { width: 16px; height: 2px; left: 2px; top: 9px; }
    #feedbackLabel { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); font-size: 13px; font-weight: 600; padding: 5px 14px; opacity: 0; pointer-events: none; z-index: 10; transition: opacity 0.15s; }
    #feedbackLabel.show { opacity: 1; }
    #feedbackLabel.correct { background: rgba(0, 255, 136, 0.9); color: #000; }
    #feedbackLabel.wrong { background: rgba(255, 64, 96, 0.9); color: #fff; }
    .answer-tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; width: 100%; max-width: 400px; }
    .answer-tile { background: var(--bg-secondary); border: 2px solid var(--border); color: var(--text-primary); padding: 12px 8px; cursor: pointer; font-family: inherit; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.15s; min-height: 64px; justify-content: center; }
    .answer-tile:active { transform: scale(0.95); border-color: var(--accent); background: rgba(0, 229, 255, 0.1); }
    .answer-tile.skip { background: var(--bg-tertiary); color: var(--text-secondary); font-size: 12px; border-style: dashed; }
    .tile-arrow { font-size: 20px; color: var(--accent); }
    .tile-letters { font-size: 11px; color: var(--text-muted); font-family: "SF Mono", "Menlo", monospace; }
    .tile-label { font-size: 10px; color: var(--text-secondary); }
</style>
