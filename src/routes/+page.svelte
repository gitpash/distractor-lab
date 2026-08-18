<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { gameModes, MODES, type GameMode } from "$lib";
    import type { Eye } from "$lib/game/types";
    import { t } from "svelte-i18n";
    import PixelIcon from "$lib/pixel-icons.svelte";
    import KeyHints from "$lib/key-hints.svelte";
    import { getHistory, clearHistory, sparklineSVG } from "$lib/game/history";
    import type { HistoryEntry } from "$lib/game/types";
    import { triggerHaptic, hapticTrigger, getPlatform } from "$lib/game/haptics";
    import { useHaptics } from "$lib/game/hooks";

    useHaptics();

    const isIOS = $derived(getPlatform() === "ios");

    const selectedGameMode = $derived(
        ($page.url.searchParams.get("game-mode") || gameModes[0]) as GameMode,
    );

    let trialCount = $state("50");
    let selectedEye = $state<Eye>("both");
    let history = $state<HistoryEntry[]>([]);

    history = getHistory();

    const setGameMode = (value: GameMode) => {
        triggerHaptic("nudge");
        const sp = new URLSearchParams($page.url.search);
        sp.set("game-mode", value);
        goto(`?${sp.toString()}`, { replaceState: true });
    };

    let focusedIndex = $state(-1);
    const isMobile = $derived(typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches);

    function startGame() {
        triggerHaptic("success");
        goto(`/${selectedGameMode}?trials=${trialCount}&eye=${selectedEye}`);
    }

    function onKeydown(e: KeyboardEvent) {
        const modes = gameModes as readonly GameMode[];
        const currentIdx = modes.indexOf(selectedGameMode);

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            const next = (currentIdx + 1) % modes.length;
            setGameMode(modes[next]);
            focusedIndex = next;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            const prev = (currentIdx - 1 + modes.length) % modes.length;
            setGameMode(modes[prev]);
            focusedIndex = prev;
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startGame();
        }
    }

    function handleClearHistory() {
        clearHistory();
        history = [];
    }
</script>

<svelte:window on:keydown={onKeydown} />

<div id="startScreen">
    <h1>{$t("app.title")}</h1>
    <p class="subtitle">
        {$t("app.subtitle")}
    </p>

    <div class="mode-grid" id="modeGrid">
        {#each gameModes as mode}
            {@const modeData = MODES[mode]}
            <button
                value={mode}
                onclick={() => setGameMode(mode)}
                {@attach isIOS ? hapticTrigger : undefined}
                class={[
                    "mode-card",
                    mode === selectedGameMode && "selected",
                    modeData.wide && "wide",
                ]}
            >
                <PixelIcon name={mode} active={mode === selectedGameMode} />
                <h3 class="title">{$t(`modes.${mode}.title`)}</h3>
                <p class="desc">{$t(`modes.${mode}.desc`)}</p>
            </button>
        {/each}
    </div>

    <div class="eye-selector">
        <span class="eye-label">{$t("settings.eye")}</span>
        <div class="eye-buttons">
            <button
                class="btn btn-ghost"
                class:active={selectedEye === "both"}
                onclick={() => { selectedEye = "both"; triggerHaptic("nudge"); }}
            >{$t("settings.eyeBoth")}</button>
            <button
                class="btn btn-ghost"
                class:active={selectedEye === "left"}
                onclick={() => { selectedEye = "left"; triggerHaptic("nudge"); }}
            >{$t("settings.eyeLeft")}</button>
            <button
                class="btn btn-ghost"
                class:active={selectedEye === "right"}
                onclick={() => { selectedEye = "right"; triggerHaptic("nudge"); }}
            >{$t("settings.eyeRight")}</button>
        </div>
    </div>

    <div class="start-actions">
        <div class="action-row">
            <a class="btn btn-secondary" href="/calibration">
                {$t("actions.calibrate")}
            </a>
            <button class="btn btn-primary" onclick={startGame} {@attach isIOS ? hapticTrigger : undefined}>
                {$t("actions.start")}
            </button>
            <label class="trials-label">
                {$t("settings.trials")}
                <select bind:value={trialCount}>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </label>
        </div>
        <a class="btn btn-ghost" href="/demo">
            {$t("actions.demo")}
        </a>
    </div>

    {#if !isMobile}
        <KeyHints layout="nav" />
    {/if}

    {#if history.length > 0}
        <div class="history-section">
            <div class="history-title">
                {$t("history.title")} ({history.length})
                {@html sparklineSVG(history.slice(0, 15).reverse().map(e => e.accuracy))}
            </div>
            <div class="history-list">
                {#each history.slice(0, 15) as entry}
                    <div class="history-row">
                        <span class="history-date">{entry.date || "—"}</span>
                        <span class="history-stats">
                            <span class="history-mode">{entry.modeTitle || entry.mode}</span>
                            {#if entry.accuracy !== undefined}
                                <span>{entry.accuracy.toFixed(0)}%</span>
                            {/if}
                        </span>
                    </div>
                {/each}
            </div>
            <div class="history-clear">
                <button class="btn btn-ghost btn-danger" onclick={handleClearHistory}>
                    {$t("history.clear")}
                </button>
            </div>
        </div>
    {/if}

    <p class="disclaimer">{$t("disclaimer")}</p>
</div>

<style>
    #startScreen {
        max-width: 680px;
        width: 100%;
        padding: 20px 16px 60px;
        text-align: center;
        position: relative;
    }
    @media (min-width: 601px) {
        #startScreen {
            padding: 40px 20px 80px;
        }
    }
    #startScreen h1 {
        font-size: clamp(1.5rem, 4vw, 1.75rem);
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 4px;
        color: var(--accent);
        text-shadow: 0 0 20px var(--accent-glow);
    }
    @media (min-width: 601px) {
        #startScreen h1 {
            margin-bottom: 6px;
        }
    }
    #startScreen .subtitle {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: 20px;
        line-height: 1.5;
    }
    @media (min-width: 601px) {
        #startScreen .subtitle {
            margin-bottom: 32px;
        }
    }
    .mode-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 16px;
    }
    @media (max-width: 600px) {
        .mode-grid {
            gap: 6px;
            margin-bottom: 12px;
        }
    }
    .mode-card {
        position: relative;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 12px 6px;
        cursor: pointer;
        text-align: center;
        transition: transform var(--duration-fast) ease-out, border-color var(--duration-normal) ease, box-shadow var(--duration-normal) ease;
    }
    @media (min-width: 601px) {
        .mode-card {
            padding: 16px 10px;
        }
    }
    @media (hover: hover) and (pointer: fine) {
        .mode-card:hover {
            border-color: var(--accent);
            box-shadow: 0 0 10px var(--accent-glow), inset 0 0 20px rgba(0, 229, 255, 0.05);
        }
    }
    .mode-card:active {
        transform: scale(0.97);
    }
    .mode-card:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }
    .mode-card.selected {
        border-color: var(--accent);
        background: rgba(0, 229, 255, 0.08);
        box-shadow: 0 0 15px var(--accent-glow);
    }
    .mode-card .title {
        font-size: var(--text-md);
        font-weight: 600;
        margin-bottom: 2px;
        position: relative;
        z-index: 1;
    }
    .mode-card .desc {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: 1.4;
        position: relative;
        z-index: 1;
    }
    .mode-card.wide {
        grid-column: span 2;
    }
    .start-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }
    .action-row {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
    }
    .trials-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-base);
        color: var(--text-secondary);
        height: 44px;
    }
    .trials-label select {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 0 10px;
        font-size: var(--text-md);
        font-family: inherit;
        height: 44px;
        transition: border-color var(--duration-normal) ease;
    }
    .trials-label select:focus {
        outline: none;
        border-color: var(--accent);
    }

    /* History */
    .history-section {
        margin-top: 36px;
        text-align: left;
        max-width: 480px;
        width: 100%;
    }
    .history-title {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-bottom: 8px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    .history-list {
        max-height: 220px;
        overflow-y: auto;
        font-size: var(--text-sm);
    }
    .history-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid var(--bg-tertiary);
        gap: 8px;
    }
    .history-row:last-child {
        border-bottom: none;
    }
    .history-date {
        color: var(--text-muted);
        flex-shrink: 0;
    }
    .history-stats {
        display: flex;
        gap: 12px;
        align-items: center;
    }
    .history-mode {
        background: var(--bg-tertiary);
        padding: 1px 8px;
        border-radius: 10px;
        font-size: var(--text-xs);
        color: var(--text-secondary);
    }
    .history-clear {
        text-align: center;
        margin-top: 10px;
    }
    .btn-danger:hover {
        color: var(--red) !important;
    }
    .eye-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
    }
    .eye-label {
        font-size: var(--text-sm);
        color: var(--text-muted);
    }
    .eye-buttons {
        display: flex;
        gap: 2px;
        background: var(--bg-tertiary);
        border-radius: var(--radius);
        padding: 2px;
    }
    .eye-buttons .btn {
        padding: 4px 10px;
        font-size: var(--text-xs);
        border-radius: calc(var(--radius) - 2px);
    }
    .eye-buttons .btn.active {
        background: var(--accent);
        color: var(--text-on-accent);
    }
    .disclaimer {
        font-size: 0.65rem;
        color: var(--text-muted);
        opacity: 0.6;
        margin-top: 24px;
        line-height: 1.4;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
</style>
