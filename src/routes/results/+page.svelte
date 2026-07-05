<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { MODES } from "$lib";
    import { saveHistory } from "$lib/game/history";

    const gameMode = $derived($page.url.searchParams.get("mode") || "classic");
    const accuracy = $derived($page.url.searchParams.get("acc") || "—");
    const correct = $derived(parseInt($page.url.searchParams.get("correct") || "0"));
    const total = $derived(parseInt($page.url.searchParams.get("total") || "0"));
    const difficulty = $derived(parseFloat($page.url.searchParams.get("difficulty") || "0"));
    const timeSeconds = $derived(parseInt($page.url.searchParams.get("time") || "0"));
    const numTrials = $derived(parseInt($page.url.searchParams.get("trials") || "50"));

    const modeConfig = $derived(MODES[gameMode as keyof typeof MODES]);

    const timeDisplay = $derived(() => {
        const m = Math.floor(timeSeconds / 60);
        const s = timeSeconds % 60;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    });

    const difficultyDisplay = $derived(() => {
        if (!modeConfig) return "";
        return modeConfig.diffLabel + ": " + modeConfig.diffFormat(difficulty);
    });

    const directionNote = $derived(() => {
        if (!modeConfig) return "";
        return modeConfig.diffLower ? "lower = better" : "higher = better";
    });

    $effect(() => {
        if (modeConfig && accuracy !== "—") {
            saveHistory({
                date: new Date().toLocaleString(),
                mode: gameMode,
                modeTitle: modeConfig.title,
                accuracy: parseFloat(accuracy),
                trials: total,
                difficulty,
                difficultyLabel: modeConfig.diffLabel,
                elapsed: timeSeconds,
            });
        }
    });
</script>

<div class="result-screen">
    <h2>{$t("results.title")}</h2>
    <div class="big-stat">{accuracy}</div>
    <div class="big-label">{$t("results.accuracy")}</div>
    <div class="result-detail">
        {$t("results.trials")}: {total} / {numTrials}
    </div>
    <div class="result-detail">
        {$t("results.difficulty")}: {difficultyDisplay()} ({directionNote()})
    </div>
    <div class="result-detail">
        {$t("results.time")}: {timeDisplay()}
    </div>
    <div class="result-actions">
        <a class="btn btn-primary" href="/{gameMode}?trials={numTrials}">
            {$t("actions.playAgain")}
        </a>
        <a class="btn btn-secondary" href="/">
            {$t("actions.home")}
        </a>
    </div>
</div>

<style>
    .result-screen {
        text-align: center;
        padding: 40px 20px;
        max-width: 500px;
        width: 100%;
    }
    .result-screen h2 {
        font-size: 24px;
        margin-bottom: 16px;
    }
    .big-stat {
        font-size: 56px;
        font-weight: 700;
        color: var(--green);
        line-height: 1;
    }
    .big-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 16px;
    }
    .result-detail {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 6px 0;
    }
    .result-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 24px;
        flex-wrap: wrap;
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
        font-size: 16px;
        padding: 14px 48px;
        border: 1px solid var(--accent);
    }
    .btn-primary:hover {
        background: var(--accent);
        color: var(--bg-primary);
    }
    .btn-secondary {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: 13px;
        padding: 10px 20px;
    }
    .btn-secondary:hover {
        background: var(--border);
    }
</style>
