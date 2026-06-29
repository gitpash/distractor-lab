<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { gameModes, MODES, type GameMode } from "$lib";
    import { t } from "svelte-i18n"; // $t alias from svelte-i18n

    // Reactive game mode from the URL (works on server and client)
    const selectedGameMode = $derived(
        $page.url.searchParams.get("game-mode") as GameMode,
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
                <span class="icon">{modeData.icon}</span>
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
        <a class="btn btn-primary" href="game"> {$t("actions.start")} </a>
        <!-- <button class="btn btn-demo" on:click={demoOrientations}>
            Показать ориентации
        </button> -->
    </div>

    <div id="historySection"></div>
</div>

<style>
    .mode-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 24px;
    }
    .mode-card {
        background: var(--bg-secondary);
        border: 2px solid var(--border);
        border-radius: var(--radius);
        padding: 16px 10px;
        cursor: pointer;
        transition:
            border-color 0.15s,
            background 0.15s,
            transform 0.1s;
        text-align: center;
    }
    .mode-card:hover {
        background: var(--bg-tertiary);
        border-color: var(--text-muted);
    }
    .mode-card.selected {
        border-color: var(--accent);
        background: rgba(88, 166, 255, 0.08);
    }
    .mode-card:active {
        transform: scale(0.97);
    }
    .mode-card .icon {
        font-size: 24px;
        margin-bottom: 6px;
    }
    .mode-card .title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 2px;
    }
    .mode-card .desc {
        font-size: 11px;
        color: var(--text-secondary);
        line-height: 1.4;
    }
    .mode-card.wide {
        grid-column: span 2;
    }
</style>
