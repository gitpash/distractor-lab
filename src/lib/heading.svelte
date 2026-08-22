<script lang="ts">
    import { page } from "$app/state";
    import { setLanguage } from "./i18n";
    import { t } from "svelte-i18n";
    import { MODES } from "$lib";
    import PixelIcon from "$lib/pixel-icons.svelte";

    let segments = $derived(page.url.pathname.split("/").filter(Boolean));
    let isHome = $derived(page.url.pathname === "/");

    function formatSegment(segment: string) {
        return segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    function isGameMode(segment: string): boolean {
        return segment in MODES;
    }
</script>

<section class="heading">
    <nav aria-label="Breadcrumb" class="breadcrumbs">
        <ol>
            <li>
                {#if isHome}
                    <span class="crumb-current" aria-current="page">{$t("actions.home")}</span>
                {:else}
                    <a href="/">{$t("actions.home")}</a>
                {/if}
            </li>

            {#each segments as segment, index}
                {@const url = `/${segments.slice(0, index + 1).join("/")}`}
                {@const isLast = index === segments.length - 1}
                {@const modeKey = `modes.${segment}.title`}
                {@const label = isGameMode(segment)
                    ? ($t(modeKey) === modeKey ? formatSegment(segment) : $t(modeKey))
                    : formatSegment(segment)}

                <li aria-current={isLast ? "page" : undefined}>
                    {#if isLast && isGameMode(segment)}
                        <span class="game-mode-label"><PixelIcon name={segment as any} static />{label}</span>
                    {:else if isLast}
                        <span>{label}</span>
                    {:else}
                        <a href={url}>
                            {label}
                        </a>
                    {/if}
                </li>
            {/each}
        </ol>
    </nav>

    <select
        class="lang-switcher"
        onchange={(e) => {
            const target = e.target as HTMLSelectElement;
            setLanguage(target.value as "en" | "ru");
        }}
    >
        <option value="en">EN</option>
        <option value="ru">RU</option>
    </select>
</section>

<style>
    .heading {
        display: flex;
        width: 100%;
        justify-content: space-between;
        padding: 12px 16px;
        align-items: center;
    }
    .breadcrumbs {
        padding: 0;
        font-size: var(--text-md);
    }
    nav.breadcrumbs li,
    nav.breadcrumbs a {
        padding: 0;
    }
    .lang-switcher {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 4px 8px;
        font-size: var(--text-sm);
        font-family: inherit;
        z-index: 100;
    }
    nav.breadcrumbs ol {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: var(--space-2);
        align-items: baseline;
    }
    /* Pipe-operator separator, drawn in CSS (font-independent — no glyph
       metrics and no Fira Code "|>" ligature). Masked to --border color. */
    nav.breadcrumbs li::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 10px;
        margin-right: var(--space-2);
        background-color: var(--border);
        vertical-align: baseline; /* bottom edge sits on the shared baseline */
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Crect x='0' y='0' width='1.5' height='10' rx='0.75'/%3E%3Cpath d='M2.75 2.5 5.75 5l-3 2.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Crect x='0' y='0' width='1.5' height='10' rx='0.75'/%3E%3Cpath d='M2.75 2.5 5.75 5l-3 2.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
    }
    nav.breadcrumbs li:first-child::before {
        content: none;
        margin: 0;
    }
    nav.breadcrumbs a {
        color: var(--text-secondary);
        text-decoration: none;
        transition: color var(--duration-normal) ease;
    }
    @media (hover: hover) and (pointer: fine) {
        nav.breadcrumbs a:hover {
            color: var(--text-primary);
        }
    }
    nav.breadcrumbs li span,
    .crumb-current {
        color: var(--text-primary);
    }
    .game-mode-label {
        color: var(--text-primary);
        font-weight: 600;
    }
    .game-mode-label :global(svg.pixel-icon) {
        margin-right: 6px;
    }
</style>
