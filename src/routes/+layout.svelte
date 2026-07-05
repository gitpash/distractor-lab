<script lang="ts">
    import "./layout.css";
    import { t } from "svelte-i18n";
    import "$lib/i18n";
    import Heading from "$lib/heading.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{$t("app.title")}</title>
    <style>
        :root {
            --bg-primary: #0a0e14;
            --bg-secondary: #131820;
            --bg-tertiary: #1a2030;
            --border: #2a3040;
            --text-primary: #e0e8f0;
            --text-secondary: #7080a0;
            --text-muted: #404858;
            --accent: #00e5ff;
            --accent-dim: #0080a0;
            --accent-glow: rgba(0, 229, 255, 0.3);
            --green: #00ff88;
            --green-bg: rgba(0, 255, 136, 0.15);
            --red: #ff4060;
            --red-bg: rgba(255, 64, 96, 0.15);
            --amber: #ffb000;
            --radius: 6px;
            --radius-sm: 4px;
        }
        * {
            margin: 0;
            padding: 0 4px;
            box-sizing: border-box;
        }
        body {
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
            -webkit-user-select: none;
        }
    </style>
</svelte:head>

<Heading />

{@render children()}
