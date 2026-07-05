<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { gameModes, MODES, type GameMode } from "$lib";
    import { t } from "svelte-i18n";
    import PixelIcon from "$lib/pixel-icons.svelte";
    import KeyHints from "$lib/key-hints.svelte";
    import { getHistory, clearHistory, sparklineSVG } from "$lib/game/history";
    import type { HistoryEntry } from "$lib/game/types";
    import { WebHaptics } from "web-haptics";
    import { onMount } from "svelte";

    let haptics: WebHaptics;

    onMount(() => {
        haptics = new WebHaptics();
        return () => haptics?.destroy();
    });

    function haptic(type: "success" | "error" | "nudge") {
        if (!haptics) return;
        haptics.trigger(type);
    }

    const selectedGameMode = $derived(
        ($page.url.searchParams.get("game-mode") || gameModes[0]) as GameMode,
    );

    let trialCount = $state("50");
    let history = $state<HistoryEntry[]>([]);

    history = getHistory();

    const setGameMode = (value: GameMode) => {
        haptic("nudge");
        const sp = new URLSearchParams($page.url.search);
        sp.set("game-mode", value);
        goto(`?${sp.toString()}`, { replaceState: true });
    };

    let focusedIndex = $state(-1);

    function startGame() {
        haptic("success");
        goto(`/${selectedGameMode}?trials=${trialCount}`);
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

    <div class="settings-row">
        <label>
            {$t("settings.trials")}
            <select bind:value={trialCount}>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </label>
    </div>

    <div class="start-actions">
        <button class="btn btn-primary" onclick={startGame}>
            {$t("actions.start")}
        </button>
        <a class="btn-demo" href="/demo">
            {$t("actions.demo")}
        </a>
    </div>

    <KeyHints layout="nav" />

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
                <button class="btn-demo" onclick={handleClearHistory}>
                    {$t("history.clear")}
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    #startScreen {
        max-width: 680px;
        width: 100%;
        padding: 40px 20px 80px;
        text-align: center;
        position: relative;
    }
    #startScreen h1 {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
        margin-bottom: 6px;
        color: var(--accent);
        text-shadow: 0 0 20px var(--accent-glow);
    }
    #startScreen .subtitle {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 32px;
        line-height: 1.5;
    }
    .mode-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 24px;
    }
    @media (400px >= width) {
        .mode-grid {
            grid-template-columns: repeat(1, 1fr);
        }
    }
    .mode-card {
        position: relative;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        padding: 16px 10px;
        cursor: pointer;
        text-align: center;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .mode-card:hover {
        border-color: var(--accent);
        box-shadow: 0 0 10px var(--accent-glow), inset 0 0 20px rgba(0, 229, 255, 0.05);
    }
    .mode-card:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }
    .mode-card.selected {
        border-color: transparent;
        background: rgba(0, 229, 255, 0.08);
        box-shadow: 0 0 15px var(--accent-glow);
    }
    .mode-card.selected::before {
        content: '';
        position: absolute;
        inset: -1px;
        padding: 2px;
        border-radius: 0;
        background: conic-gradient(
            from var(--border-angle, 0deg),
            var(--accent) 0%,
            var(--bg-secondary) 8%,
            var(--bg-secondary) 25%,
            var(--accent) 30%,
            var(--bg-secondary) 35%,
            var(--bg-secondary) 100%
        );
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        z-index: 0;
        animation: borderSpin 3s linear infinite;
    }
    @property --border-angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
    }
    @keyframes borderSpin {
        to { --border-angle: 360deg; }
    }
    .mode-card .title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 2px;
        position: relative;
        z-index: 1;
    }
    .mode-card .desc {
        font-size: 11px;
        color: var(--text-secondary);
        line-height: 1.4;
        position: relative;
        z-index: 1;
    }
    .mode-card.wide {
        grid-column: span 2;
    }
    .settings-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    .settings-row label {
        font-size: 13px;
        color: var(--text-secondary);
    }
    .settings-row select {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border);
        padding: 6px 10px;
        font-size: 14px;
        font-family: inherit;
    }
    .start-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
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
        box-shadow: 0 0 20px var(--accent-glow);
    }

    /* History */
    .history-section {
        margin-top: 36px;
        text-align: left;
        max-width: 480px;
        width: 100%;
    }
    .history-title {
        font-size: 12px;
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
        font-size: 12px;
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
        font-size: 11px;
        color: var(--text-secondary);
    }
    .history-clear {
        text-align: center;
        margin-top: 10px;
    }
    .btn-demo {
        background: transparent;
        color: var(--text-muted);
        border: none;
        font-size: 12px;
        padding: 8px 16px;
        cursor: pointer;
        font-family: inherit;
    }
    .btn-demo:hover {
        color: var(--text-secondary);
    }
</style>
