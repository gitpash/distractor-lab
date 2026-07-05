<script lang="ts">
    import { page } from "$app/state";
    import { setLanguage } from "./i18n";
    let segments = $derived(page.url.pathname.split("/").filter(Boolean));

    function formatSegment(segment: string) {
        return segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    }
</script>

<section class="heading">
    <nav aria-label="Breadcrumb" class="breadcrumbs">
        <ol>
            <li>
                <a
                    href={"/" + page.url.search}
                    aria-disabled={page.url.pathname === "/"}>Home</a
                >
            </li>

            {#each segments as segment, index}
                {@const url = `/${segments.slice(0, index + 1).join("/")}`}
                {@const isLast = index === segments.length - 1}

                <li aria-current={isLast ? "page" : undefined}>
                    {#if isLast}
                        <span> {formatSegment(segment)}</span>
                    {:else}
                        <a href={url + page.url.search}
                            >{formatSegment(segment)}</a
                        >
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
    }
    .breadcrumbs {
        padding: 0;
    }
    .heading :global(li),
    .heading :global(a) {
        padding: 0;
    }
    .lang-switcher {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border);
        padding: 4px 8px;
        font-size: 12px;
        font-family: inherit;
        z-index: 100;
    }
    nav.breadcrumbs ol {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 0.5rem;
    }
    nav.breadcrumbs a {
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.15s;
    }
    nav.breadcrumbs a:hover {
        color: var(--accent);
    }
    nav.breadcrumbs a[aria-disabled="true"] {
        color: var(--text-muted);
        pointer-events: none;
    }
    nav.breadcrumbs li::before {
        content: "/";
        margin-right: 0.5rem;
        color: var(--text-muted);
    }
    nav.breadcrumbs li:first-child::before {
        content: "";
        margin: 0;
    }
    nav.breadcrumbs li span {
        color: var(--text-secondary);
    }
</style>
