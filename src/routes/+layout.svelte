<script lang="ts">
    import "./layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import { locale, t } from "svelte-i18n";
    import { setLanguage } from "$lib/i18n";

    // Import i18n initialization to register messages
    import "$lib/i18n";

    let { children } = $props();

    const toggleLang = () => {
        setLanguage($locale === "en" ? "ru" : "en");
    };
</script>

<svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{$t("app.title")}</title>
    <style>
        :root {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --border: #30363d;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --text-muted: #484f58;
            --accent: #58a6ff;
            --accent-dim: #1f6feb;
            --green: #3fb950;
            --green-bg: rgba(63, 185, 80, 0.15);
            --red: #f85149;
            --red-bg: rgba(248, 81, 73, 0.15);
            --yellow: #d29922;
            --radius: 12px;
            --radius-sm: 8px;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family:
                -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
                Helvetica, Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
            -webkit-user-select: none;
        }

        /* === START SCREEN === */
        #startScreen {
            max-width: 680px;
            width: 100%;
            padding: 40px 20px;
            text-align: center;
        }
        #startScreen h1 {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 6px;
            color: var(--text-primary);
        }
        #startScreen .subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 32px;
            line-height: 1.5;
        }

        /* === SETTINGS ROW === */
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
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 14px;
        }

        /* === BUTTONS === */
        .btn {
            border: none;
            border-radius: var(--radius-sm);
            font-weight: 600;
            cursor: pointer;
            transition:
                transform 0.1s,
                opacity 0.15s;
            touch-action: manipulation;
        }
        .btn:active {
            transform: scale(0.95);
        }
        .btn-primary {
            background: var(--accent-dim);
            color: #fff;
            font-size: 16px;
            padding: 14px 48px;
            border-radius: var(--radius);
        }
        .btn-primary:hover {
            background: var(--accent);
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
        .btn-demo {
            background: transparent;
            color: var(--text-muted);
            font-size: 12px;
            padding: 8px 16px;
            margin-top: 10px;
        }
        .btn-demo:hover {
            color: var(--text-secondary);
        }
        .start-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        /* === GAME SCREEN === */
        #gameScreen {
            display: none;
            width: 100%;
            max-width: 600px;
            padding: 0 16px;
            flex-direction: column;
            align-items: center;
        }
        #topBar {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0 8px;
        }
        .mode-badge {
            background: var(--accent-dim);
            color: #fff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
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
            transition: width 0.2s;
        }
        .trial-counter {
            font-size: 12px;
            color: var(--text-muted);
            white-space: nowrap;
            font-variant-numeric: tabular-nums;
        }

        /* === CANVAS === */
        #canvasWrap {
            position: relative;
            width: min(80vw, 80vh, 400px);
            aspect-ratio: 1;
            background: #808080;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px 0;
            overflow: hidden;
        }
        canvas#gaborCanvas {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
        }
        #fixation {
            position: absolute;
            width: 20px;
            height: 20px;
            pointer-events: none;
            opacity: 0;
        }
        #fixation::before,
        #fixation::after {
            content: "";
            position: absolute;
            background: #fff;
            border-radius: 1px;
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
            font-size: 13px;
            font-weight: 600;
            padding: 5px 14px;
            border-radius: 6px;
            opacity: 0;
            transition: opacity 0.15s;
            pointer-events: none;
            z-index: 10;
        }
        #feedbackLabel.show {
            opacity: 1;
        }
        #feedbackLabel.correct {
            background: rgba(63, 185, 80, 0.9);
            color: #000;
        }
        #feedbackLabel.wrong {
            background: rgba(248, 81, 73, 0.9);
            color: #fff;
        }

        /* === ANSWER PANEL === */
        #answerPanel {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .btn-answer {
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 14px 20px;
            font-size: 16px;
            border-radius: var(--radius-sm);
            min-width: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: 1px solid var(--border);
            transition:
                background 0.15s,
                border-color 0.15s;
        }
        .btn-answer:hover {
            background: var(--bg-tertiary);
            border-color: var(--text-muted);
        }
        .btn-answer.correct {
            background: var(--green-bg);
            border-color: var(--green);
            color: var(--green);
        }
        .btn-answer.wrong {
            background: var(--red-bg);
            border-color: var(--red);
            color: var(--red);
        }
        .key-badge {
            display: inline-block;
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 1px 6px;
            font-size: 11px;
            font-family: "SF Mono", "Menlo", "Consolas", monospace;
            line-height: 1.4;
        }

        /* === HUD === */
        #hud {
            display: flex;
            gap: 20px;
            margin-top: 14px;
            font-size: 13px;
            color: var(--text-secondary);
            font-variant-numeric: tabular-nums;
        }
        .hud-stat b {
            color: var(--text-primary);
        }
        .hud-diff {
            color: var(--accent);
        }
        .hud-diff b {
            color: var(--accent);
        }

        /* === RESULT SCREEN === */
        #resultScreen {
            display: none;
            text-align: center;
            padding: 40px 20px;
            max-width: 500px;
        }
        #resultScreen h2 {
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

        /* === HISTORY === */
        #historySection {
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
        .history-sparkline {
            flex-shrink: 0;
        }
        #clearHistoryBtn {
            margin-top: 10px;
        }

        /* === LANGUAGE SWITCHER === */
        .lang-switcher {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 100;
        }
        .lang-btn {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 4px 10px;
            font-size: 12px;
            cursor: pointer;
            font-weight: 600;
        }
        .lang-btn:hover {
            background: var(--bg-tertiary);
        }
    </style></svelte:head
>
<div class="lang-switcher">
    <button onclick={toggleLang} class="lang-btn">
        {$locale === "en" ? "RU" : "EN"}
    </button>
</div>
{@render children()}
