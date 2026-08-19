<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";
    import { MODES } from "$lib";
    import type { Eye } from "$lib/game/types";
    import { saveHistory } from "$lib/game/history";
    import { loadProfile } from "$lib/game/calibration";

    const gameMode = $derived($page.url.searchParams.get("mode") || "classic");
    const isCalibration = $derived(gameMode === "calibration");

    const accuracy = $derived($page.url.searchParams.get("acc") || "—");
    const correct = $derived(parseInt($page.url.searchParams.get("correct") || "0"));
    const total = $derived(parseInt($page.url.searchParams.get("total") || "0"));
    const difficulty = $derived(parseFloat($page.url.searchParams.get("difficulty") || "0"));
    const timeSeconds = $derived(parseInt($page.url.searchParams.get("time") || "0"));
    const numTrials = $derived(parseInt($page.url.searchParams.get("trials") || "50"));
    const selectedEye = $derived(($page.url.searchParams.get("eye") || "both") as Eye);

    const calProfile = $derived.by(() => {
        if (!isCalibration) return null;
        return loadProfile();
    });

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

    const qualityKey = $derived.by(() => {
        if (!calProfile) return "";
        switch (calProfile.quality) {
            case "good": return "results.calQualityGood";
            case "marginal": return "results.calQualityMarginal";
            case "poor": return "results.calQualityPoor";
        }
    });

    const qualityAdvice = $derived.by(() => {
        if (!calProfile) return [];
        const keys: string[] = [];
        if (calProfile.quality === "marginal") {
            keys.push("results.calAdviceMarginal");
        } else if (calProfile.quality === "poor") {
            keys.push("results.calAdvicePoor");
        }
        return keys;
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
                eye: selectedEye,
            });
        }
    });
</script>

<div class="result-screen">
    {#if isCalibration && calProfile}
        <h2>{$t("results.calibrationTitle")}</h2>

        <div class="cal-quality-badge {calProfile.quality}">
            {$t(qualityKey)}
        </div>

        <div class="cal-range">
            <span class="cal-range-label">{$t("results.calContrastRange")}</span>
            <span class="cal-range-value">
                {(calProfile.contrastFloor * 100).toFixed(0)}% – {(calProfile.contrastCeil * 100).toFixed(0)}%
            </span>
        </div>

        <div class="cal-range">
            <span class="cal-range-label">{$t("results.calGamma")}</span>
            <span class="cal-range-value">≈ {calProfile.gamma.toFixed(1)}</span>
        </div>

        <p class="cal-explanation">{$t("results.calExplanation")}</p>

        {#if qualityAdvice.length > 0}
            <div class="cal-advice">
                {#each qualityAdvice as key}
                    <p>{$t(key)}</p>
                {/each}
            </div>
        {/if}

        <div class="result-actions">
            <a class="btn btn-primary" href="/">
                {$t("results.calStartTraining")}
            </a>
            <a class="btn btn-secondary" href="/calibration">
                {$t("actions.recalibrate")}
            </a>
        </div>
    {:else}
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
    {/if}
</div>

<style>
    .result-screen {
        text-align: center;
        padding: 40px 20px;
        max-width: 500px;
        width: 100%;
    }
    @media (max-width: 600px) {
        .result-screen {
            padding: 24px 16px;
        }
    }
    .result-screen h2 {
        font-size: var(--text-xl);
        font-weight: 700;
        margin-bottom: 16px;
    }
    .big-stat {
        font-size: var(--text-4xl);
        font-weight: 700;
        color: var(--accent);
        line-height: 1;
        letter-spacing: -0.02em;
    }
    .big-label {
        font-size: var(--text-md);
        color: var(--text-secondary);
        margin-bottom: 16px;
    }
    .result-detail {
        font-size: var(--text-base);
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
    /* Calibration results */
    .cal-quality-badge {
        display: inline-block;
        font-size: var(--text-sm);
        font-weight: 600;
        padding: 6px 16px;
        border-radius: 999px;
        margin-bottom: 20px;
    }
    .cal-quality-badge.good {
        background: var(--green);
        color: #000;
    }
    .cal-quality-badge.marginal {
        background: var(--amber);
        color: #000;
    }
    .cal-quality-badge.poor {
        background: var(--red);
        color: #fff;
    }
    .cal-range {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        margin-bottom: 8px;
    }
    .cal-range-label {
        font-size: var(--text-sm);
        color: var(--text-muted);
    }
    .cal-range-value {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
    }
    .cal-explanation {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 16px 0;
    }
    .cal-advice {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 12px 16px;
        margin-bottom: 16px;
        text-align: left;
    }
    .cal-advice p {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
    }
</style>
