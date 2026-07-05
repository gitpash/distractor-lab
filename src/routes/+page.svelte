<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { gameModes, MODES, type GameMode } from "$lib";
    import { t } from "svelte-i18n";
    import PixelIcon from "$lib/pixel-icons.svelte";

    const selectedGameMode = $derived(
        ($page.url.searchParams.get("game-mode") || gameModes[0]) as GameMode,
    );

    const setGameMode = (value: GameMode) => {
        const sp = new URLSearchParams($page.url.search);
        sp.set("game-mode", value);
        goto(`?${sp.toString()}`, { replaceState: true });
    };
</script>

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
                {#if mode === selectedGameMode}
                    <span class="pixel-star"></span>
                {/if}
                <PixelIcon name={mode} />
                <h3 class="title">{$t(`modes.${mode}.title`)}</h3>
                <p class="desc">{$t(`modes.${mode}.desc`)}</p>
            </button>
        {/each}
    </div>

    <div class="settings-row">
        <label>
            {$t("settings.trials")}
            <select id="trialCount">
                <option value="30">30</option>
                <option value="50" selected>50</option>
                <option value="100">100</option>
            </select>
        </label>
    </div>

    <div class="start-actions">
        <a class="btn btn-primary" href={selectedGameMode}>
            {$t("actions.start")}
        </a>
    </div>

    <div id="historySection"></div>
</div>

<style>
    #startScreen {
        max-width: 680px;
        width: 100%;
        padding: 40px 20px;
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
    .pixel-star {
        position: absolute;
        top: 4px;
        right: 6px;
        width: 10px;
        height: 10px;
        z-index: 2;
        image-rendering: pixelated;
        background: var(--accent);
        clip-path: polygon(
            50% 0%,
            62% 35%,
            100% 35%,
            68% 57%,
            80% 91%,
            50% 70%,
            20% 91%,
            32% 57%,
            0% 35%,
            38% 35%
        );
        filter: drop-shadow(0 0 3px var(--accent-glow));
        animation: starPulse 2s ease-in-out infinite;
    }
    @keyframes starPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
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
</style>
